'use client'
import { useState } from 'react'

export default function ChatInterface({ agencyId }: { agencyId: string }) {
  const [messages, setMessages] = useState<{role: 'user'|'loft', content: string}[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/loft/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, agency_id: agencyId })
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'loft', content: data.reply }])
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'loft', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#2A2A2A' }} className="rounded-[16px] p-5 flex flex-col mt-6">
      <div style={{ color: '#888888', letterSpacing: '1px' }} className="text-[11px] uppercase font-bold mb-4">
        Ask LOFT Anything
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4" style={{ minHeight: 120, maxHeight: 280 }}>
        {messages.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center">
            <p style={{ color: '#555555' }} className="text-center text-sm">
              Ask me about any client, portfolio health,<br/>or what needs attention today.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'loft' && (
                <div style={{ backgroundColor: '#F6FF80', color: '#000000' }} className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 mt-1">
                  L
                </div>
              )}
              <div 
                style={{ 
                  backgroundColor: m.role === 'user' ? '#F6FF80' : '#333333',
                  color: m.role === 'user' ? '#000000' : '#FFFFFF'
                }}
                className="rounded-[12px] px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap"
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your clients..."
          style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
          className="flex-1 border rounded-[12px] px-4 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#F6FF80]"
        />
        <button 
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: '#F6FF80', color: '#000000' }}
          className="rounded-[8px] px-5 py-2.5 font-bold text-sm disabled:opacity-50"
        >
          {isLoading ? '...' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
