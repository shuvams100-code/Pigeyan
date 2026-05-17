import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: agencyData, error: agencyErr } = await serviceSupabase
    .from('agencies')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (agencyErr || !agencyData) {
    return NextResponse.json({ sessions: [] })
  }

  const { data, error } = await serviceSupabase
    .from('chat_sessions')
    .select('id, title, agency_id')
    .eq('agency_id', agencyData.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) {
    return NextResponse.json({ sessions: [] })
  }

  return NextResponse.json({ sessions: data })
}
