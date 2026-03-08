import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* Baidu Translate API credentials from Supabase secrets */
const BAIDU_APP_ID = Deno.env.get('BAIDU_TRANSLATE_APP_ID') || ''
const BAIDU_SECRET = Deno.env.get('BAIDU_TRANSLATE_SECRET') || ''

/* MD5 helper — pure JS implementation (Web Crypto doesn't support MD5) */
function md5(str: string): string {
  const bytes = new TextEncoder().encode(str)
  function toU32(n: number) { return n >>> 0 }
  function rotl(x: number, n: number) { return toU32((x << n) | (x >>> (32 - n))) }
  const S = [
    7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
    5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
    4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
    6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21
  ]
  const K: number[] = []
  for (let i = 0; i < 64; i++) K[i] = Math.floor(2**32 * Math.abs(Math.sin(i + 1))) >>> 0

  const bitLen = bytes.length * 8
  const padLen = ((bytes.length + 8) % 64 === 0) ? bytes.length + 8 : bytes.length + 64 - ((bytes.length + 8) % 64)
  const padded = new Uint8Array(padLen + 8)
  padded.set(bytes)
  padded[bytes.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(padLen, bitLen >>> 0, true)
  view.setUint32(padLen + 4, Math.floor(bitLen / 2**32) >>> 0, true)

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476
  for (let off = 0; off < padded.length; off += 64) {
    const M: number[] = []
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(off + j * 4, true)
    let A = a0, B = b0, C = c0, D = d0
    for (let i = 0; i < 64; i++) {
      let F: number, g: number
      if (i < 16) { F = (B & C) | (~B & D); g = i }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16 }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16 }
      else { F = C ^ (B | ~D); g = (7 * i) % 16 }
      F = toU32(F + A + K[i] + M[g])
      A = D; D = C; C = B; B = toU32(B + rotl(F, S[i]))
    }
    a0 = toU32(a0 + A); b0 = toU32(b0 + B); c0 = toU32(c0 + C); d0 = toU32(d0 + D)
  }

  function hex32(n: number) {
    const v = new DataView(new ArrayBuffer(4)); v.setUint32(0, n, true)
    return Array.from(new Uint8Array(v.buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  return hex32(a0) + hex32(b0) + hex32(c0) + hex32(d0)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { q, from, to } = await req.json()

    if (!q || typeof q !== 'string' || q.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid query' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!BAIDU_APP_ID || !BAIDU_SECRET) {
      return new Response(JSON.stringify({ error: 'Translation not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const fromLang = from || 'auto'
    const toLang = to || 'zh'
    const salt = Date.now().toString()
    const sign = md5(BAIDU_APP_ID + q + salt + BAIDU_SECRET)

    const params = new URLSearchParams({
      q, from: fromLang, to: toLang,
      appid: BAIDU_APP_ID, salt, sign
    })

    const res = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate?' + params.toString())
    const data = await res.json()

    if (data.error_code) {
      return new Response(JSON.stringify({ error: data.error_msg || 'Translate failed', code: data.error_code }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    /* Return only translated results */
    const results = (data.trans_result || []).map((r: { src: string; dst: string }) => ({
      src: r.src, dst: r.dst
    }))

    return new Response(JSON.stringify({ from: data.from, to: data.to, results }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
