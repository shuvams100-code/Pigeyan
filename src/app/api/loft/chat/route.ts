import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, agency_id } = await req.json()

    // Rate Limiting (Rule 10)
    // Check how many requests this agency has made in the last hour
    const { count, error: countError } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency_id)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    
    if (count !== null && count > 50) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }
    
    // Log usage
    await supabase.from('api_usage').insert({ agency_id, endpoint: '/api/loft/chat' })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: "You are LOFT, the client intelligence engine for Pigeyan. You have access to the agency's full client portfolio. Answer questions clearly and concisely about client health, relationships, and actions needed. Be direct. Be specific. Never make up data you don't have."
        },
        { role: 'user', content: message }
      ]
    })

    const reply = completion.choices[0]?.message?.content || 'I cannot answer that right now.'
    
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('API /loft/chat error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
