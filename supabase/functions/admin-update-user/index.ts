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

    const body = await req.json()
    const { action, user_id } = body

    if (!action || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing action or user_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Prevent self-modification
    if (user_id === caller.id && (action === 'ban' || action === 'delete')) {
      return new Response(JSON.stringify({ error: 'Cannot ban/delete yourself' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    switch (action) {
      case 'update_metadata': {
        const metadata: Record<string, any> = {}
        if (body.nickname !== undefined) metadata.nickname = body.nickname
        if (body.board !== undefined) metadata.board = body.board
        if (Object.keys(metadata).length === 0) {
          return new Response(JSON.stringify({ error: 'No fields to update' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { user_metadata: metadata })
        if (error) throw error
        // Also update leaderboard nickname if provided
        if (body.nickname) {
          await supabaseAdmin.from('leaderboard').update({ nickname: body.nickname }).eq('user_id', user_id)
          await supabaseAdmin.from('kw_class_students').update({ student_name: body.nickname }).eq('user_id', user_id)
        }
        break
      }

      case 'reset_password': {
        if (!body.new_password || body.new_password.length < 6) {
          return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password: body.new_password })
        if (error) throw error
        break
      }

      case 'assign_class': {
        if (!body.class_id) {
          return new Response(JSON.stringify({ error: 'Missing class_id' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        // Get class info
        const { data: cls } = await supabaseAdmin
          .from('kw_classes').select('id, grade, school_id').eq('id', body.class_id).single()
        if (!cls) {
          return new Response(JSON.stringify({ error: 'Class not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        // Get user nickname
        const { data: { user: targetUser } } = await supabaseAdmin.auth.admin.getUserById(user_id)
        const nickname = targetUser?.user_metadata?.nickname || targetUser?.email || ''
        // Remove from old class, then insert into new class
        await supabaseAdmin.from('kw_class_students').delete().eq('user_id', user_id)
        await supabaseAdmin.from('kw_class_students').insert({
          class_id: body.class_id,
          user_id: user_id,
          student_name: nickname
        })
        // Update auth metadata
        await supabaseAdmin.auth.admin.updateUserById(user_id, {
          user_metadata: { class_id: body.class_id, school_id: cls.school_id, board: cls.grade }
        })
        // Update leaderboard
        await supabaseAdmin.from('leaderboard').update({
          class_id: body.class_id, school_id: cls.school_id, board: cls.grade
        }).eq('user_id', user_id)
        break
      }

      case 'change_role': {
        if (!body.role || !['student', 'teacher', 'guest'].includes(body.role)) {
          return new Response(JSON.stringify({ error: 'Invalid role' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          user_metadata: { role: body.role }
        })
        if (error) throw error
        break
      }

      case 'ban': {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          ban_duration: '876000h' // ~100 years
        })
        if (error) throw error
        break
      }

      case 'unban': {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          ban_duration: 'none'
        })
        if (error) throw error
        break
      }

      case 'delete': {
        // Cascade delete related data first (order matters for FK constraints)
        await supabaseAdmin.from('assignment_results').delete().eq('student_id', user_id)
        await supabaseAdmin.from('notifications').delete().eq('user_id', user_id)
        await supabaseAdmin.from('feedback').delete().eq('user_id', user_id)
        await supabaseAdmin.from('leaderboard').delete().eq('user_id', user_id)
        await supabaseAdmin.from('kw_class_students').delete().eq('user_id', user_id)
        await supabaseAdmin.from('vocab_progress').delete().eq('user_id', user_id)
        // Delete auth user
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)
        if (error) throw error
        break
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action: ' + action }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
