'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import Greeting from '@/components/dashboard/Greeting'
import ChatInterface from '@/components/dashboard/ChatInterface'
import ActionItems from '@/components/dashboard/ActionItems'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DashboardClient({ user }: { user: any }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch real agency ID on mount
  useEffect(() => {
    supabase.from('agencies')
      .select('id')
      .eq('email', user.email)
      .single()
      .then(({ data }) => {
        if (data) setAgencyId(data.id)
      })
  }, [supabase, user.email])

  // Fetch initial sessions
  useEffect(() => {
    supabase.from('chat_sessions')
      .select('id, title, agency_id')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setSessions(data)
      })
  }, [supabase])

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
              onSessionCreated={(id: string) => {
                setActiveSessionId(id)
                // Proactively refetch to bypass any replication delay
                supabase.from('chat_sessions')
                  .select('id, title, agency_id')
                  .order('created_at', { ascending: false })
                  .limit(20)
                  .then(({ data }) => {
                    if (data) setSessions(data)
                  })
              }}
              isExpanded={!!activeSessionId}
            />

            {!activeSessionId && (
              <div className="w-full">
                <ActionItems agencyId={user.id} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
