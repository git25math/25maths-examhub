import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPER_ADMIN_EMAIL = 'zhuxingda86@hotmail.com'

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

    // Verify caller is super admin
    const supabaseCaller = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user: caller } } = await supabaseCaller.auth.getUser()
    if (!caller || caller.email !== SUPER_ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Dump all key tables
    const tables = ['schools', 'teachers', 'kw_classes', 'kw_class_students', 'leaderboard',
                    'vocab_progress', 'kw_assignments', 'assignment_results', 'vocab_levels',
                    'notifications', 'feedback']

    const backup: Record<string, any> = {
      timestamp: new Date().toISOString(),
      version: 'v1'
    }

    for (const table of tables) {
      const { data, error } = await supabaseAdmin.from(table).select('*')
      backup[table] = { count: data?.length || 0, rows: data || [], error: error?.message || null }
    }

    // Also backup auth users (metadata only, no passwords)
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    backup['auth_users'] = {
      count: authUsers?.length || 0,
      rows: (authUsers || []).map(u => ({
        id: u.id,
        email: u.email,
        user_metadata: u.user_metadata,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned_at: u.banned_at
      }))
    }

    return new Response(JSON.stringify(backup), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
