import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify caller
    const supabaseCaller = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user: caller } } = await supabaseCaller.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if caller is super admin
    const SUPER_ADMIN_EMAIL = 'zhuxingda86@hotmail.com'
    const isSA = caller.email === SUPER_ADMIN_EMAIL

    // Verify caller is teacher (skip for super admin)
    let teacher: any = null
    if (!isSA) {
      const { data: t } = await supabaseAdmin
        .from('teachers').select('id, school_id').eq('user_id', caller.id).single()
      if (!t) {
        return new Response(JSON.stringify({ error: 'Not a teacher' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      teacher = t
    }

    const { student_user_id, new_password } = await req.json()
    if (!student_user_id || !new_password) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify student belongs to same school (skip for super admin)
    if (!isSA) {
      const { data: student } = await supabaseAdmin
        .from('kw_class_students')
        .select('id, class_id, kw_classes!inner(school_id)')
        .eq('user_id', student_user_id)
        .limit(1)
        .single()

      if (!student || (student as any).kw_classes.school_id !== teacher.school_id) {
        return new Response(JSON.stringify({ error: 'Student not in your school' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Reset password
    const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(
      student_user_id, { password: new_password }
    )

    if (resetErr) {
      return new Response(JSON.stringify({ error: resetErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
