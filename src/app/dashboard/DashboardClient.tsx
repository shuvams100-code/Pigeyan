'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import Greeting from '@/components/dashboard/Greeting'
import ChatInterface from '@/components/dashboard/ChatInterface'
import WhatIsHappening from '@/components/dashboard/WhatIsHappening'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSearchParams } from 'next/navigation'

export default function DashboardClient({ user }: { user: any }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [prefill, setPrefill] = useState<{ message: string; title: string } | null>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()

  // Check URL query parameters for pre-filled signals transition
  useEffect(() => {
    const p = searchParams.get('prefill')
    const t = searchParams.get('title')
    const sid = searchParams.get('session_id')
    if (p && t) {
      setPrefill({ message: p, title: t })
      setActiveSessionId('temp_id')
      window.history.replaceState(null, '', '/dashboard')
    } else if (sid) {
      setActiveSessionId(sid)
      window.history.replaceState(null, '', '/dashboard')
    }
  }, [searchParams])

  // Fetch real agency ID on mount
  useEffect(() => {
    fetch('/api/loft/agency')
      .then(res => res.json())
      .then(data => {
        if (data.agency_id) setAgencyId(data.agency_id)
      })
      .catch(err => console.error('Error loading agency:', err))
  }, [])

  // Fetch initial sessions from server-side endpoint
  useEffect(() => {
    fetch('/api/loft/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) setSessions(data.sessions)
      })
      .catch(err => console.error('Error loading sessions:', err))
  }, [])

  // Fetch happening data (insights and reminders) once at parent level
  useEffect(() => {
    fetch('/api/loft/happening')
      .then(res => res.json())
      .then(data => {
        if (data.insights) setInsights(data.insights)
        if (data.reminders) setReminders(data.reminders)
      })
      .catch(err => console.error('Error loading happening portfolio insights:', err))
  }, [])

  // Subscribe to Realtime changes for chat_sessions
  useEffect(() => {
    if (!agencyId) return

    const channel = supabase
      .channel('realtime-chat-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          if (payload.new && payload.new.agency_id === agencyId) {
            setSessions(prev => {
              if (prev.some(s => s.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, agencyId])

  const activeSession = sessions.find(s => s.id === activeSessionId)
  const activeSessionTitle = activeSession ? activeSession.title : (activeSessionId === 'temp_id' ? 'New Chat' : '')

  return (
    <div className="flex h-screen w-full bg-[#1E1E1E] text-white overflow-hidden font-sans">
      <Sidebar 
        userEmail={user.email} 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId} 
        sessions={sessions}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar 
          onHome={() => setActiveSessionId(null)} 
          showHome={!!activeSessionId} 
          sessionTitle={activeSessionTitle}
        />
        
        <main className={`flex-1 overflow-y-auto p-8 flex flex-col ${!activeSessionId ? 'justify-center items-center' : ''}`}>
          <div className={`w-full ${!activeSessionId ? 'max-w-[680px] mx-auto space-y-8' : 'max-w-4xl mx-auto h-full flex flex-col'}`}>
            
            {!activeSessionId && (
               <div className="mb-2">
                 <Greeting user={user} centered={true} />
               </div>
            )}

            <ChatInterface 
              agencyId={agencyId || user.id} 
              activeSessionId={activeSessionId} 
              prefill={prefill}
              clearPrefill={() => setPrefill(null)}
              onSessionCreated={(id: string) => {
                setActiveSessionId(id)
                // Proactively refetch sessions from the backend list
                fetch('/api/loft/sessions')
                  .then(res => res.json())
                  .then(data => {
                    if (data.sessions) setSessions(data.sessions)
                  })
              }}
              isExpanded={!!activeSessionId}
              insights={insights}
            />

            {!activeSessionId && (
              <div className="w-full">
                <WhatIsHappening 
                  onAskLoft={(msg, title) => {
                    setPrefill({ message: msg, title })
                    setActiveSessionId('temp_id')
                  }} 
                  insights={insights}
                  reminders={reminders}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
