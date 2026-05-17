import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const session_id = url.searchParams.get('session_id')
  if (!session_id) return NextResponse.json({ messages: [] })

  const supabase = createRouteHandlerClient({ cookies })
  const { data, error } = await supabase.from('chat_messages').select('role, content').eq('session_id', session_id).order('created_at', { ascending: true })
  if (error || !data) return NextResponse.json({ messages: [] })
  
  return NextResponse.json({ messages: data })
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let { message, agency_id, session_id } = await req.json()

    // Query agencies table to resolve the real agency ID where email matches auth user
    const { data: agencyData, error: agencyErr } = await supabase
      .from('agencies')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (agencyErr || !agencyData) {
      console.error('[API] Failed to fetch agency for email:', session.user.email, agencyErr)
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const realAgencyId = agencyData.id
    console.log('[API] Resolved agency ID:', realAgencyId, 'for email:', session.user.email)

    if (!session_id) {
      const title = message.substring(0, 40)
      const { data: newSession, error: sErr } = await supabase.from('chat_sessions').insert({
        agency_id: realAgencyId,
        title
      }).select('id').single()
      
      if (!sErr && newSession) {
        session_id = newSession.id
      } else {
        console.error('[API] chat_sessions insert error:', sErr)
      }
    }

    if (session_id) {
      await supabase.from('chat_messages').insert({
        session_id,
        role: 'user',
        content: message
      })
    }

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
    } catch(e) {}

    if (session_id) {
      await supabase.from('chat_messages').insert({
        session_id,
        role: 'loft',
        content: reply
      })
    }
    
    return NextResponse.json({ reply, session_id })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
