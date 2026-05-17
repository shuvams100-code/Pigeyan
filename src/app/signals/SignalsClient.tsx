'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { X, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Insight = {
  id: string
  insight_type: string
  insight_content: string
  affected_clients: string[]
  priority: string
  created_at: string
}

export default function SignalsClient({ user }: { user: any }) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [filter, setFilter] = useState<'All' | 'At Risk' | 'Opportunities' | 'Follow Up'>('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch insights
    fetch('/api/loft/happening')
      .then(res => res.json())
      .then(data => {
        if (data.insights) setInsights(data.insights)
      })
      .catch(err => console.error('Error loading insights:', err))
      .finally(() => setLoading(false))

    // Fetch active sessions
    fetch('/api/loft/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) setSessions(data.sessions)
      })
      .catch(err => console.error('Error loading sessions:', err))
  }, [])

  const handleDismissInsight = async (id: string) => {
    setInsights(prev => prev.filter(ins => ins.id !== id))
    try {
      await fetch('/api/loft/happening/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch (err) {
      console.error('Failed to dismiss insight:', err)
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'upsell_opportunity':
      case 'positive_sentiment':
        return '#16A34A' // Green
      case 'at_risk':
      case 'no_reply':
        return '#DC2626' // Red
      case 'follow_up_needed':
        return '#D97706' // Amber
      default:
        return '#888888' // Gray
    }
  }

  // Filtering logic
  const getFilteredInsights = () => {
    return insights.filter(ins => {
      if (filter === 'All') return true
      if (filter === 'At Risk') return ins.insight_type === 'at_risk' || ins.insight_type === 'no_reply'
      if (filter === 'Opportunities') return ins.insight_type === 'upsell_opportunity' || ins.insight_type === 'positive_sentiment'
      if (filter === 'Follow Up') return ins.insight_type === 'follow_up_needed'
      return true
    })
  }

  const filtered = getFilteredInsights()
  const itemsPerPage = 20
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedInsights = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="flex h-screen w-full bg-[#1E1E1E] text-white overflow-hidden font-sans">
      <Sidebar 
        userEmail={user.email} 
        activeSessionId={null} 
        onSelectSession={(id: string) => router.push(`/dashboard?session_id=${id}`)} 
        sessions={sessions}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar 
          onHome={() => router.push('/dashboard')} 
          showHome={true} 
          sessionTitle=""
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-white font-bold text-24px">Signals</h1>
              <p className="text-[#888888] text-[14px] mt-1">AI-detected patterns across your client portfolio</p>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-3 flex-wrap">
              {(['All', 'At Risk', 'Opportunities', 'Follow Up'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setFilter(tab)
                    setPage(1)
                  }}
                  style={{
                    backgroundColor: filter === tab ? '#F6FF80' : '#2A2A2A',
                    color: filter === tab ? '#000000' : '#888888'
                  }}
                  className="px-4 py-1.5 rounded-[20px] text-[13px] font-medium transition-colors focus:outline-none"
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center py-12 text-[#555555]">Loading signals...</div>
            ) : paginatedInsights.length === 0 ? (
              <div className="text-center py-16 text-[#555555] text-sm leading-relaxed border border-dashed border-[#333333] rounded-[12px]">
                No signals detected yet.<br />
                Connect your client data to start seeing portfolio intelligence.
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedInsights.map(ins => {
                  const clientName = ins.affected_clients?.[0] || 'Unknown Client'
                  return (
                    <div 
                      key={ins.id} 
                      style={{ backgroundColor: '#2A2A2A' }} 
                      className="rounded-[12px] p-4 flex items-center justify-between shadow-sm transition-all hover:bg-[#313131]"
                    >
                      {/* Left Side */}
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                        <div 
                          className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" 
                          style={{ backgroundColor: getInsightColor(ins.insight_type) }} 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-bold text-[14px] truncate">{clientName}</div>
                          <div className="text-[#888888] text-[12px] mt-0.5 break-words">
                            {ins.insight_content}
                          </div>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => {
                            const messagePrompt = `Tell me more about this: ${ins.insight_content} regarding client ${clientName}. What should I do about this?`
                            const sessionTitle = `Signal: ${ins.insight_content.substring(0, 30)}`
                            router.push(`/dashboard?prefill=${encodeURIComponent(messagePrompt)}&title=${encodeURIComponent(sessionTitle)}`)
                          }}
                          className="text-[#888888] hover:text-[#F6FF80] transition-colors focus:outline-none"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDismissInsight(ins.id)}
                          className="text-[#888888] hover:text-[#F6FF80] transition-colors focus:outline-none"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-1.5 rounded-[20px] bg-[#2A2A2A] text-[#888888] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors focus:outline-none"
                    >
                      Prev
                    </button>
                    <span className="text-[#888888] text-xs">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-1.5 rounded-[20px] bg-[#2A2A2A] text-[#888888] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors focus:outline-none"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
