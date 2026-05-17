'use client'
import { useState, useEffect, useRef } from 'react'

export default function ChatInterface({ 
  agencyId, 
  activeSessionId, 
  onSessionCreated, 
  isExpanded,
  prefill,
  clearPrefill
}: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Listen for prefill messages
  useEffect(() => {
    if (prefill && activeSessionId === 'temp_id') {
      const msg = prefill.message
      const title = prefill.title
      if (clearPrefill) clearPrefill()
      
      setMessages([{ role: 'user', content: msg }])
      setIsLoading(true)
      
      fetch('/api/loft/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, agency_id: agencyId, title })
      })
        .then(res => res.json())
        .then(data => {
          if (data.session_id) {
            onSessionCreated(data.session_id)
          }
          if (data.reply) {
            setMessages(prev => [...prev, { role: 'loft', content: data.reply }])
          }
        })
        .catch(err => {
          setMessages(prev => [...prev, { role: 'loft', content: 'Sorry, I encountered an error. Please try again.' }])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [prefill, activeSessionId, agencyId, onSessionCreated, clearPrefill])

  useEffect(() => {
    if (activeSessionId && activeSessionId !== 'temp_id') {
      fetch(`/api/loft/chat?session_id=${activeSessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) setMessages(data.messages)
        })
    } else if (!activeSessionId) {
      setMessages([])
    }
  }, [activeSessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsLoading(true)

    if (!activeSessionId) {
      onSessionCreated('temp_id')
    }

    try {
      const res = await fetch('/api/loft/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, agency_id: agencyId, session_id: activeSessionId === 'temp_id' ? null : activeSessionId })
      })
      const data = await res.json()
      
      if (data.session_id && (!activeSessionId || activeSessionId === 'temp_id')) {
        onSessionCreated(data.session_id)
      }
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'loft', content: data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'loft', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isExpanded) {
    return (
      <form onSubmit={handleSubmit} className="relative w-full">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask LOFT anything..."
          style={{ backgroundColor: '#2A2A2A' }}
          className="w-full border-none rounded-[50px] px-6 py-4 text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#333333] pr-28"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{ backgroundColor: '#F6FF80', color: '#000000' }}
          className="absolute right-2 top-2 bottom-2 rounded-[40px] px-5 font-bold text-sm disabled:opacity-50 transition-opacity"
        >
          Ask
        </button>
      </form>
    )
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-6 pt-4 pb-8 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'loft' && (
              <div style={{ backgroundColor: '#F6FF80', color: '#000000' }} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                L
              </div>
            )}
            <div 
              style={{ 
                backgroundColor: m.role === 'user' ? '#F6FF80' : '#2A2A2A',
                color: m.role === 'user' ? '#000000' : '#FFFFFF'
              }}
              className="rounded-[16px] px-5 py-3 max-w-[70%] text-[15px] whitespace-pre-wrap leading-relaxed"
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div style={{ backgroundColor: '#F6FF80', color: '#000000' }} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
               L
             </div>
             <div style={{ backgroundColor: '#2A2A2A' }} className="rounded-[16px] px-5 py-3 text-white">...</div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-2 pb-6">
        <form onSubmit={handleSubmit} className="relative w-full">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask LOFT anything..."
            style={{ backgroundColor: '#2A2A2A' }}
            className="w-full border-none rounded-[50px] px-6 py-4 text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#333333] pr-28"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{ backgroundColor: '#F6FF80', color: '#000000' }}
            className="absolute right-2 top-2 bottom-2 rounded-[40px] px-5 font-bold text-sm disabled:opacity-50 transition-opacity"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  )
}
