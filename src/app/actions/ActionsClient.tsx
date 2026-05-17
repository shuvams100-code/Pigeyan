'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { useRouter } from 'next/navigation'

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

export default function ActionsClient({ user }: { user: any }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [filter, setFilter] = useState<'All' | 'Today' | 'Overdue' | 'Upcoming'>('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch reminders
    fetch('/api/loft/happening')
      .then(res => res.json())
      .then(data => {
        if (data.reminders) setReminders(data.reminders)
      })
      .catch(err => console.error('Error loading reminders:', err))
      .finally(() => setLoading(false))

    // Fetch active sessions
    fetch('/api/loft/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) setSessions(data.sessions)
      })
      .catch(err => console.error('Error loading sessions:', err))
  }, [])

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

  // Filtering logic
  const getFilteredReminders = () => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    return reminders.filter(rem => {
      if (filter === 'All') return rem.status === 'active'
      
      const isToday = rem.due_at && rem.due_at.startsWith(todayStr)
      if (filter === 'Today') return isToday

      const dueDate = new Date(rem.due_at)
      if (filter === 'Overdue') {
        // Due date is in the past, and NOT today
        return dueDate < now && !isToday && rem.status === 'active'
      }

      if (filter === 'Upcoming') {
        // Due date is in the future, and NOT today
        return dueDate > now && !isToday && rem.status === 'active'
      }

      return true
    })
  }

  const filtered = getFilteredReminders()
  const itemsPerPage = 20
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedReminders = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
              <h1 className="text-white font-bold text-24px">Actions</h1>
              <p className="text-[#888888] text-[14px] mt-1">Your pending tasks and follow-ups</p>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-3 flex-wrap">
              {(['All', 'Today', 'Overdue', 'Upcoming'] as const).map(tab => (
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
              <div className="text-center py-12 text-[#555555]">Loading actions...</div>
            ) : paginatedReminders.length === 0 ? (
              <div className="text-center py-16 text-[#555555] text-sm leading-relaxed border border-dashed border-[#333333] rounded-[12px]">
                No pending actions. You're all caught up.
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedReminders.map(rem => (
                  <div 
                    key={rem.id} 
                    style={{ backgroundColor: '#2A2A2A' }} 
                    className="rounded-[12px] p-4 flex items-center justify-between shadow-sm transition-all hover:bg-[#313131]"
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
                            {rem.clients?.name || 'General'}
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
                        className="text-[#16A34A] hover:bg-[#16A34A] hover:text-white font-bold text-[12px] rounded-[20px] px-3.5 py-1.5 border border-[#16A34A] bg-transparent transition-all focus:outline-none"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}

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
