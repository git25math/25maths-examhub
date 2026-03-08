import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* Baidu Translate API credentials from Supabase secrets */
const BAIDU_APP_ID = Deno.env.get('BAIDU_TRANSLATE_APP_ID') || ''
const BAIDU_SECRET = Deno.env.get('BAIDU_TRANSLATE_SECRET') || ''

/* MD5 helper (Web Crypto API) */
async function md5(str: string): Promise<string> {
  const data = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('MD5', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
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
    const sign = await md5(BAIDU_APP_ID + q + salt + BAIDU_SECRET)

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
