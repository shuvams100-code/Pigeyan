'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type Insight = {
  id: string
  insight_type: string
  insight_content: string
  affected_clients: string[]
  priority: string
  created_at: string
}

type Reminder = {
  id: string
  client_id: string | null
  priority: 'high' | 'medium' | 'low'
  message: string
  due_at: string
  type: string
  status: string
  clients?: { name: string } | null
}

export default function WhatIsHappening({ 
  onAskLoft 
}: { 
  onAskLoft: (message: string, title: string) => void 
}) {
  const [activeTab, setActiveTab] = useState<'signals' | 'actions'>('signals')
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'older'>('today')
  const [insights, setInsights] = useState<Insight[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHappeningData = async () => {
    try {
      const res = await fetch('/api/loft/happening')
      const data = await res.json()
      if (data.insights) setInsights(data.insights)
      if (data.reminders) setReminders(data.reminders)
    } catch (err) {
      console.error('Error fetching dashboard happening items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHappeningData()
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

  const handleDoneReminder = async (id: string) => {
    setReminders(prev => prev.filter(rem => rem.id !== id))
    try {
      await fetch('/api/loft/happening/done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch (err) {
      console.error('Failed to complete reminder:', err)
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

  const getReminderPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#DC2626'
      case 'medium':
        return '#D97706'
      case 'low':
        return '#16A34A'
      default:
        return '#888888'
    }
  }

  // Split reminders into Today and Older
  const getFilteredReminders = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    return reminders.filter(r => {
      const isToday = r.due_at && r.due_at.startsWith(todayStr)
      if (activeSubTab === 'today') return isToday
      return !isToday
    })
  }

  const truncateString = (str: string, len: number) => {
    if (str.length > len) {
      return str.substring(0, len) + '...'
    }
    return str
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="w-full mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-[16px]">What's Happening</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 border-b border-[#333333]">
        <button
          onClick={() => setActiveTab('signals')}
          style={{
            color: activeTab === 'signals' ? '#F6FF80' : '#888888',
            borderBottom: activeTab === 'signals' ? '2px solid #F6FF80' : '2px solid transparent'
          }}
          className="pb-2 font-medium text-sm transition-colors focus:outline-none"
        >
          Signals
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          style={{
            color: activeTab === 'actions' ? '#F6FF80' : '#888888',
            borderBottom: activeTab === 'actions' ? '2px solid #F6FF80' : '2px solid transparent'
          }}
          className="pb-2 font-medium text-sm transition-colors focus:outline-none"
        >
          Actions
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-[#555555] text-sm">Loading...</div>
        ) : activeTab === 'signals' ? (
          /* SIGNALS TAB */
          insights.length === 0 ? (
            <div className="text-center py-10 text-[#555555] text-sm font-medium leading-relaxed px-4">
              No signals yet. Add clients and connect <br />
              your data to start seeing portfolio intelligence.
            </div>
          ) : (
            insights.map(ins => {
              const clientName = ins.affected_clients?.[0] || 'Unknown Client'
              return (
                <div 
                  key={ins.id} 
                  style={{ backgroundColor: '#2A2A2A' }} 
                  className="rounded-[12px] p-4 flex items-center justify-between mb-2 shadow-sm transition-all hover:bg-[#313131]"
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
                        {truncateString(ins.insight_content, 80)}
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                      onClick={() => {
                        const messagePrompt = `Tell me more about this: ${ins.insight_content} regarding client ${clientName}. What should I do about this?`
                        const sessionTitle = `Signal: ${ins.insight_content.substring(0, 30)}`
                        onAskLoft(messagePrompt, sessionTitle)
                      }}
                      className="text-[#F6FF80] hover:text-[#000000] border border-[#F6FF80] hover:bg-[#F6FF80] font-bold text-[12px] rounded-[20px] px-3.5 py-1.5 transition-all focus:outline-none"
                    >
                      Ask LOFT →
                    </button>
                    <button
                      onClick={() => handleDismissInsight(ins.id)}
                      className="text-[#555555] hover:text-white transition-colors focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )
        ) : (
          /* ACTIONS TAB */
          <div>
            {/* Sub Tabs */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => setActiveSubTab('today')}
                className={`text-[12px] px-3 py-1 rounded-full border transition-all focus:outline-none ${
                  activeSubTab === 'today' 
                    ? 'border-[#F6FF80] text-[#F6FF80] bg-[#2A2A2A]' 
                    : 'border-[#333333] text-[#888888] hover:text-white bg-transparent'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveSubTab('older')}
                className={`text-[12px] px-3 py-1 rounded-full border transition-all focus:outline-none ${
                  activeSubTab === 'older' 
                    ? 'border-[#F6FF80] text-[#F6FF80] bg-[#2A2A2A]' 
                    : 'border-[#333333] text-[#888888] hover:text-white bg-transparent'
                }`}
              >
                Older
              </button>
            </div>

            {getFilteredReminders().length === 0 ? (
              <div className="text-center py-10 text-[#555555] text-sm">
                No action items. You're all caught up.
              </div>
            ) : (
              getFilteredReminders().map(rem => (
                <div 
                  key={rem.id} 
                  style={{ backgroundColor: '#2A2A2A' }} 
                  className="rounded-[12px] p-4 flex items-center justify-between mb-2 shadow-sm transition-all hover:bg-[#313131]"
                >
                  {/* Left Side */}
                  <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" 
                      style={{ backgroundColor: getReminderPriorityColor(rem.priority) }} 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-[14px]">
                          {rem.clients?.name || 'Unknown Client'}
                        </span>
                        <span className="bg-[#333333] text-[#888888] text-[9px] font-bold uppercase rounded px-1.5 py-0.5 tracking-wider">
                          {rem.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[#888888] text-[12px] mt-1 break-words">
                        {rem.message}
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-[#888888] text-[11px] font-medium">
                      {formatDate(rem.due_at)}
                    </span>
                    <button
                      onClick={() => handleDoneReminder(rem.id)}
                      className="text-[#888888] hover:text-white hover:border-white text-xs px-3.5 py-1.5 border border-[#333333] bg-transparent rounded-[20px] transition-colors focus:outline-none"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
