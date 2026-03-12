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

    const { page = 1, per_page = 1000, search = '', role_filter = '' } = await req.json()

    // List all auth users
    const { data: { users: authUsers }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: per_page
    })
    if (listErr) throw listErr

    // Get class/school info for all users (separate queries to avoid nested join issues)
    const { data: classStudents } = await supabaseAdmin
      .from('kw_class_students')
      .select('user_id, class_id, student_name')

    const { data: allClasses } = await supabaseAdmin
      .from('kw_classes')
      .select('id, name, grade, school_id')

    const { data: allSchools } = await supabaseAdmin
      .from('schools')
      .select('id, name')

    // Build lookup maps
    const schoolLookup: Record<string, string> = {}
    if (allSchools) allSchools.forEach((s: any) => { schoolLookup[s.id] = s.name })

    const classLookup: Record<string, any> = {}
    if (allClasses) allClasses.forEach((c: any) => {
      classLookup[c.id] = { name: c.name, grade: c.grade, school_id: c.school_id, school_name: schoolLookup[c.school_id] || null }
    })

    const classMap: Record<string, any> = {}
    if (classStudents) {
      classStudents.forEach((cs: any) => {
        const cls = classLookup[cs.class_id] || {}
        classMap[cs.user_id] = {
          class_id: cs.class_id,
          class_name: cls.name || null,
          school_id: cls.school_id || null,
          school_name: cls.school_name || null
        }
      })
    }

    // Transform users
    let users = authUsers.map((u: any) => {
      const meta = u.user_metadata || {}
      const cls = classMap[u.id] || {}
      return {
        id: u.id,
        email: u.email || '',
        nickname: meta.nickname || cls.student_name || '',
        role: meta.role || 'guest',
        board: meta.board || '',
        class_name: cls.class_name || null,
        class_id: cls.class_id || meta.class_id || null,
        school_name: cls.school_name || null,
        school_id: cls.school_id || meta.school_id || null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned_at: u.banned_at || null
      }
    })

    // In-memory filters
    if (role_filter) {
      users = users.filter((u: any) => u.role === role_filter)
    }
    if (search) {
      const q = search.toLowerCase()
      users = users.filter((u: any) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.nickname || '').toLowerCase().includes(q)
      )
    }

    return new Response(JSON.stringify({ users, total: users.length }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
