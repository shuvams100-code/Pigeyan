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

  const { data, error } = await serviceSupabase
    .from('agencies')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (error || !data) {
    console.error('[API] Failed to fetch agency for email:', session.user.email, error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ agency_id: data.id })
}
