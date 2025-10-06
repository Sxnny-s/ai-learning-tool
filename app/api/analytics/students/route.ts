// total_sessions, avg_session_length, last_active_at.
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from('profiles').select('*')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  

  let res = []


  data.forEach(student => {
    let studentObject = {
      user_id: student['user_id'],
      name: student['full_name'],
      total_sessions: student['session_count'],
      avg_session_length: student['total_time_seconds'] / student['session_count'],
      last_active_at: student['last_session_ended_at']
    }

    res.push(studentObject)
  })
  

 
  return new Response(JSON.stringify({data: res}), { status: 200 })
  


}
