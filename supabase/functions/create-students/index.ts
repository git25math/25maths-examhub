import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Verify caller is a teacher
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

    // Decode JWT to get caller user_id
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

    // Verify caller is teacher
    const { data: teacher } = await supabaseAdmin
      .from('teachers').select('id, school_id').eq('user_id', caller.id).single()
    if (!teacher) {
      return new Response(JSON.stringify({ error: 'Not a teacher' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { class_id, students } = await req.json()
    if (!class_id || !students || !Array.isArray(students)) {
      return new Response(JSON.stringify({ error: 'Missing class_id or students' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (students.length > 30) {
      return new Response(JSON.stringify({ error: 'Max 30 students per batch' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get class info (grade, school_id)
    const { data: cls } = await supabaseAdmin
      .from('kw_classes').select('grade, school_id').eq('id', class_id).single()
    if (!cls || cls.school_id !== teacher.school_id) {
      return new Response(JSON.stringify({ error: 'Class not found or not yours' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const created: any[] = []
    const errors: any[] = []

    for (const s of students) {
      try {
        if (!s.email || !s.password || !s.name) {
          errors.push({ email: s.email, error: 'Missing fields' })
          continue
        }

        // Create user with student role
        const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
          email: s.email,
          password: s.password,
          email_confirm: true,
          user_metadata: {
            role: 'student',
            nickname: s.name,
            board: cls.grade,
            class_id: class_id,
            school_id: cls.school_id
          }
        })

        if (userErr) {
          errors.push({ email: s.email, error: userErr.message })
          continue
        }

        // Insert class_students record
        await supabaseAdmin.from('kw_class_students').insert({
          class_id: class_id,
          user_id: userData.user.id,
          student_name: s.name
        })

        // Insert initial leaderboard record
        await supabaseAdmin.from('leaderboard').upsert({
          user_id: userData.user.id,
          nickname: s.name,
          score: 0,
          mastery_pct: 0,
          rank_emoji: '🥉',
          total_words: 0,
          mastered_words: 0,
          board: cls.grade,
          school_id: cls.school_id,
          class_id: class_id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        created.push({ email: s.email, name: s.name, user_id: userData.user.id })

        // Rate limiting: 100ms between creates
        await sleep(100)
      } catch (e) {
        errors.push({ email: s.email, error: e.message })
      }
    }

    return new Response(JSON.stringify({ created, errors }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
