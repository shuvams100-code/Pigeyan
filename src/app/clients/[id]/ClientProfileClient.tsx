'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { ArrowLeft, Mail, Phone, Building, Briefcase, Heart, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ClientProfileClient({ clientId, user }: { clientId: string; user: any }) {
  const [client, setClient] = useState<any>(null)
  const [memory, setMemory] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch client details
    fetch(`/api/loft/clients?id=${clientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Client not found')
        return res.json()
      })
      .then(data => {
        if (data.client) setClient(data.client)
        if (data.memory) setMemory(data.memory)
      })
      .catch(err => console.error('Error fetching client details:', err))
      .finally(() => setLoading(false))

    // Fetch active sessions for the sidebar
    fetch('/api/loft/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) setSessions(data.sessions)
      })
      .catch(err => console.error('Error fetching sessions:', err))
  }, [clientId])

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'green': return '#16A34A'
      case 'amber': return '#D97706'
      case 'red': return '#DC2626'
      default: return '#16A34A'
    }
  }

  const getHealthText = (status: string) => {
    switch (status) {
      case 'green': return 'Healthy'
      case 'amber': return 'Attention'
      case 'red': return 'At Risk'
      default: return 'Healthy'
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
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
          <div className="w-full max-w-3xl mx-auto space-y-6">
            
            {/* Back Link */}
            <button
              onClick={() => router.push('/clients')}
              className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-sm font-semibold focus:outline-none"
            >
              <ArrowLeft size={16} />
              Back to Clients
            </button>

            {loading ? (
              <div className="bg-[#2A2A2A] rounded-[16px] p-8 space-y-4 animate-pulse">
                <div className="w-48 h-6 bg-[#333333] rounded" />
                <div className="w-32 h-4 bg-[#333333] rounded" />
                <div className="w-full h-32 bg-[#333333] rounded mt-6" />
              </div>
            ) : !client ? (
              <div className="bg-[#2A2A2A] rounded-[16px] p-8 text-center text-[#888888]">
                Client not found.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Client Main Summary Card */}
                <div style={{ backgroundColor: '#2A2A2A' }} className="rounded-[16px] p-8 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    
                    {/* Details */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[#888888] text-xs font-mono tracking-wider">{client.client_id}</span>
                        <h1 className="text-white font-bold text-2xl mt-1">{client.name}</h1>
                        <p className="text-[#888888] text-sm mt-0.5">{client.company}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1.5 bg-[#333333] text-[#888888] text-xs font-semibold rounded-[4px] px-2.5 py-1">
                          <Briefcase size={12} />
                          {client.industry}
                        </span>
                        <span 
                          style={{ borderColor: getHealthColor(client.health_status) }} 
                          className="inline-flex items-center gap-1.5 border bg-transparent text-xs font-semibold rounded-[4px] px-2.5 py-1"
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: getHealthColor(client.health_status) }}
                          />
                          <span style={{ color: getHealthColor(client.health_status) }}>
                            {getHealthText(client.health_status)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Loft Memory score */}
                    <div 
                      style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
                      className="rounded-[12px] border p-5 flex flex-col items-center justify-center text-center w-40 flex-shrink-0"
                    >
                      <Heart size={24} className="text-[#F6FF80] mb-1.5 animate-pulse" />
                      <span className="text-[#888888] text-[11px] font-bold uppercase tracking-wider">Relationship score</span>
                      <span className="text-white text-3xl font-bold mt-1">
                        {memory ? memory.relationship_health_score : 50}%
                      </span>
                    </div>

                  </div>
                </div>

                {/* Contact & Meta info Card */}
                <div style={{ backgroundColor: '#2A2A2A' }} className="rounded-[16px] p-8 shadow-md space-y-6">
                  <h3 className="text-white font-bold text-[15px] border-b border-[#333333] pb-3">Client Contact Info</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                        <Mail size={18} />
                      </div>
                      <div>
                        <div className="text-[#888888] text-[11px] font-bold uppercase tracking-wider">Email Address</div>
                        <a href={`mailto:${client.email}`} className="text-white text-sm hover:underline">{client.email}</a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                        <Phone size={18} />
                      </div>
                      <div>
                        <div className="text-[#888888] text-[11px] font-bold uppercase tracking-wider">Phone Number</div>
                        <div className="text-white text-sm">{client.phone || 'Not Provided'}</div>
                      </div>
                    </div>

                    {/* Added Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="text-[#888888] text-[11px] font-bold uppercase tracking-wider">Date Added</div>
                        <div className="text-white text-sm">{formatDate(client.created_at)}</div>
                      </div>
                    </div>

                    {/* Last Interaction */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                        <Building size={18} />
                      </div>
                      <div>
                        <div className="text-[#888888] text-[11px] font-bold uppercase tracking-wider">Last Interaction</div>
                        <div className="text-white text-sm">{formatDate(client.last_interaction_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
