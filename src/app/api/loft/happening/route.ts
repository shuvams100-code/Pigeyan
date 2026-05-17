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

  // 1. Fetch agency ID
  const { data: agencyData, error: agencyErr } = await serviceSupabase
    .from('agencies')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (agencyErr || !agencyData) {
    return NextResponse.json({ insights: [], reminders: [] })
  }

  const agencyId = agencyData.id

  // 2. Fetch insights
  const { data: insights, error: insErr } = await serviceSupabase
    .from('portfolio_insights')
    .select('*')
    .eq('agency_id', agencyId)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (insErr) {
    console.error('[API] Error loading portfolio_insights:', insErr)
  }

  // 3. Fetch reminders
  const { data: reminders, error: remErr } = await serviceSupabase
    .from('reminders')
    .select('id, client_id, priority, message, due_at, type, status, clients(name)')
    .eq('agency_id', agencyId)
    .eq('status', 'active')

  if (remErr) {
    console.error('[API] Error loading reminders:', remErr)
  }

  return NextResponse.json({
    insights: insights || [],
    reminders: reminders || []
  })
}
