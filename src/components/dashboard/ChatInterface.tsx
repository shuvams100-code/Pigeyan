'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

function generateQuestionsFromInsights(insights: any[]) {
  const base = [
    "Ask LOFT anything...",
    "How is my portfolio doing today?",
    "Who needs my attention most right now?",
    "Who should I follow up with today?",
  ]
  
  if (!insights || insights.length === 0) 
    return base
  
  const dynamic = insights.slice(0, 5).map(insight => {
    const client = insight.affected_clients?.[0] 
      || 'this client'
    switch(insight.insight_type) {
      case 'upsell_opportunity':
        return `What should I do about the ${client} upsell opportunity?`
      case 'at_risk':
        return `How serious is the ${client} churn risk?`
      case 'follow_up_needed':
        return `What should I say to ${client} in my follow-up?`
      case 'no_reply':
        return `Why hasn't ${client} responded and what should I do?`
      case 'positive_sentiment':
        return `How can I capitalise on momentum with ${client}?`
      default:
        return `Tell me what's happening with ${client}`
    }
  })
  
  return [...base, ...dynamic]
}

export default function ChatInterface({ 
  agencyId, 
  activeSessionId, 
  onSessionCreated, 
  isExpanded,
  prefill,
  clearPrefill,
  insights = []
}: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Animated dynamic placeholders
  const placeholders = useMemo(() => 
    generateQuestionsFromInsights(insights), 
    [insights]
  )

  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Debug log placeholders array
  useEffect(() => {
    console.log('[ChatInterface] Placeholders generated:', placeholders)
  }, [placeholders])

  // Reset index when placeholders list changes
  useEffect(() => {
    setPlaceholderIndex(0)
  }, [placeholders])

  // Cycle placeholder index every 3000ms with smooth 400ms fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPlaceholderIndex(prev => 
          (prev + 1) % placeholders.length
        )
        setVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [placeholders])

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
      <div 
        style={{ backgroundColor: '#2A2A2A' }}
        className="relative w-full rounded-[50px] overflow-hidden"
      >
        {!input && (
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-sm select-none z-10"
            style={{
              color: '#888888',
              opacity: visible ? 1 : 0,
              transition: 'opacity 400ms ease-in-out',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: 'calc(100% - 100px)'
            }}
          >
            {placeholders[placeholderIndex]}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative w-full">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=" "
            style={{ backgroundColor: 'transparent' }}
            className="w-full border-none px-6 py-4 text-white focus:outline-none pr-28 relative z-20"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{ backgroundColor: '#F6FF80', color: '#000000' }}
            className="absolute right-2 top-2 bottom-2 rounded-[40px] px-5 font-bold text-sm disabled:opacity-50 transition-opacity z-30"
          >
            Ask
          </button>
        </form>
      </div>
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
              className="rounded-[16px] px-5 py-3 max-w-[70%] text-[15px] leading-relaxed"
            >
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap">{m.content}</div>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({children}) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({children}) => (
                      <strong className="font-bold text-white">
                        {children}
                      </strong>
                    ),
                    ul: ({children}) => (
                      <ul className="list-disc list-inside mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className="list-decimal list-inside mb-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({children}) => (
                      <li className="text-gray-300">{children}</li>
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              )}
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
        <div 
          style={{ backgroundColor: '#2A2A2A' }}
          className="relative w-full rounded-[50px] overflow-hidden"
        >
          {!input && (
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-sm select-none z-10"
              style={{
                color: '#888888',
                opacity: visible ? 1 : 0,
                transition: 'opacity 400ms ease-in-out',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: 'calc(100% - 100px)'
              }}
            >
              {placeholders[placeholderIndex]}
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative w-full">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=" "
              style={{ backgroundColor: 'transparent' }}
              className="w-full border-none px-6 py-4 text-white focus:outline-none pr-28 relative z-20"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{ backgroundColor: '#F6FF80', color: '#000000' }}
              className="absolute right-2 top-2 bottom-2 rounded-[40px] px-5 font-bold text-sm disabled:opacity-50 transition-opacity z-30"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
