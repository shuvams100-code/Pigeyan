import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Create a service client that bypasses RLS for backend operations
const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return NextResponse.json({ messages: [] })

  const serviceSupabase = getServiceClient()
  const { data, error } = await serviceSupabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  if (error || !data) {
    console.error('[API] GET chat_messages error:', error)
    return NextResponse.json({ messages: [] })
  }
  
  return NextResponse.json({ messages: data })
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let { message, agency_id, session_id } = await req.json()

    const serviceSupabase = getServiceClient()

    // 1. Query agencies table using service role client to get the true agency ID
    const { data: agencyData, error: agencyErr } = await serviceSupabase
      .from('agencies')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (agencyErr || !agencyData) {
      console.error('[API] Failed to fetch agency for email:', session.user.email, agencyErr)
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const realAgencyId = agencyData.id
    console.log('[API] Resolved agency ID:', realAgencyId, 'for user:', session.user.email)

    // 2. Create Chat Session if not exists
    if (!session_id) {
      const title = message.substring(0, 40)
      const { data: newSession, error: sErr } = await serviceSupabase
        .from('chat_sessions')
        .insert({
          agency_id: realAgencyId,
          title
        })
        .select('id')
        .single()
      
      if (!sErr && newSession) {
        session_id = newSession.id
        console.log('[API] Created new chat session:', session_id)
      } else {
        console.error('[API] chat_sessions insert error:', sErr)
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }
    }

    // 3. Save User Message
    if (session_id) {
      const { error: msgErr } = await serviceSupabase
        .from('chat_messages')
        .insert({
          session_id,
          role: 'user',
          content: message
        })
      if (msgErr) console.error('[API] Error saving user message:', msgErr)
    }

    // 4. OpenAI Chat
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    let reply = 'I cannot answer that right now.'
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: "You are LOFT, the client intelligence engine for Pigeyan..." },
          { role: 'user', content: message }
        ]
      })
      reply = completion.choices[0]?.message?.content || reply
    } catch(e) {
      console.error('[API] OpenAI completion error:', e)
    }

    // 5. Save LOFT Message
    if (session_id) {
      const { error: replyErr } = await serviceSupabase
        .from('chat_messages')
        .insert({
          session_id,
          role: 'loft',
          content: reply
        })
      if (replyErr) console.error('[API] Error saving LOFT message:', replyErr)
    }
    
    return NextResponse.json({ reply, session_id })
  } catch (error: any) {
    console.error('[API] POST exception:', error)
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 })
  }
}
