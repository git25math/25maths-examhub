import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, password, name, school_code } = await req.json()

    if (!email || !password || !name || !school_code) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify school code
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools').select('id, name').eq('code', school_code).single()

    if (schoolErr || !school) {
      return new Response(JSON.stringify({ error: 'Invalid school code' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create user with teacher role
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { role: 'teacher', nickname: name, school_id: school.id }
    })

    if (userErr) {
      return new Response(JSON.stringify({ error: userErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert teacher record
    const { error: teacherErr } = await supabaseAdmin.from('teachers').insert({
      user_id: userData.user.id,
      school_id: school.id,
      display_name: name
    })

    if (teacherErr) {
      return new Response(JSON.stringify({ error: teacherErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: userData.user.id,
      school_id: school.id,
      school_name: school.name
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
