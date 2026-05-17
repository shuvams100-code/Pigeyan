'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Reminder = {
  id: string
  client_id: string
  priority: 'high' | 'medium' | 'low'
  message: string
  due_at: string
  clients: { name: string }
}

export default function ActionItems({ agencyId }: { agencyId: string }) {
  const [tab, setTab] = useState<'today' | 'older'>('today')
  const [items, setItems] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const today = new Date()
  const dateString = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  useEffect(() => {
    fetchItems()
  }, [tab])

  const fetchItems = async () => {
    setLoading(true)
    const todayStr = new Date().toISOString().split('T')[0]
    
    let query = supabase
      .from('reminders')
      .select('id, client_id, priority, message, due_at, clients(name)')
      .eq('agency_id', agencyId)
      .eq('status', 'active')

    if (tab === 'today') {
      const { data, error } = await query
      if (data && !error) {
        const filtered = data.filter((d: any) => d.due_at && d.due_at.startsWith(todayStr))
        setItems(filtered as any)
      } else {
        setItems([])
      }
    } else {
      const { data, error } = await query.lt('due_at', todayStr)
      if (data && !error) setItems(data as any)
      else setItems([])
    }
    setLoading(false)
  }

  const handleDismiss = async (id: string) => {
    await supabase.from('reminders').update({ status: 'dismissed' }).eq('id', id)
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const priorityColors = {
    high: '#DC2626',
    medium: '#D97706',
    low: '#16A34A'
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-[16px]">Action Items</h2>
        <span className="text-[#888888] text-[14px]">{dateString}</span>
      </div>
      
      <div className="flex gap-6 mb-4 border-b border-[#333333]">
        <button 
          onClick={() => setTab('today')}
          style={{ 
            color: tab === 'today' ? '#F6FF80' : '#888888',
            borderBottom: tab === 'today' ? '2px solid #F6FF80' : '2px solid transparent'
          }}
          className="pb-2 font-medium text-sm transition-colors"
        >
          Today
        </button>
        <button 
          onClick={() => setTab('older')}
          style={{ 
            color: tab === 'older' ? '#F6FF80' : '#888888',
            borderBottom: tab === 'older' ? '2px solid #F6FF80' : '2px solid transparent'
          }}
          className="pb-2 font-medium text-sm transition-colors"
        >
          Older
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-[#555555] text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-[#555555] text-sm whitespace-pre-line">
            {tab === 'today' ? "No action items for today.\nYou're all caught up." : "No older pending items."}
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} style={{ backgroundColor: '#2A2A2A' }} className="rounded-[12px] p-4 flex items-center justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: priorityColors[item.priority] || priorityColors.medium }} />
                <div>
                  <div className="text-white font-bold text-[14px]">{item.clients?.name || 'Unknown Client'}</div>
                  <div className="text-[#888888] text-[12px] mt-0.5">{item.message}</div>
                </div>
              </div>
              <button 
                onClick={() => handleDismiss(item.id)}
                className="text-[#888888] text-xs px-3 py-1.5 border border-[#333333] bg-transparent rounded-[6px] hover:text-white transition-colors flex-shrink-0 ml-4"
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
