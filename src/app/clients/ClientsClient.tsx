'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { Search, Plus, X, MoreHorizontal, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  client_id: string
  name: string
  company: string
  industry: string
  health_status: 'green' | 'amber' | 'red'
  email: string
  phone: string | null
  last_interaction_at?: string | null
  created_at: string
}

export default function ClientsClient({ user }: { user: any }) {
  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    industry: 'Legal Services',
    email: '',
    phone: ''
  })
  const [formErrors, setFormErrors] = useState({
    email: ''
  })

  // Action Dropdowns
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Success Toast
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const router = useRouter()

  const fetchClients = () => {
    fetch('/api/loft/clients')
      .then(res => res.json())
      .then(data => {
        if (data.clients) setClients(data.clients)
      })
      .catch(err => console.error('Error fetching clients:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchClients()

    // Fetch active sessions for the sidebar
    fetch('/api/loft/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) setSessions(data.sessions)
      })
      .catch(err => console.error('Error fetching sessions:', err))
  }, [])

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const triggerToast = (message: string) => {
    setSuccessToast(message)
    setTimeout(() => {
      setSuccessToast(null)
    }, 3000)
  }

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      company: '',
      industry: 'Legal Services',
      email: '',
      phone: ''
    })
    setFormErrors({ email: '' })
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (client: Client) => {
    setClientToEdit(client)
    setFormData({
      name: client.name,
      company: client.company || '',
      industry: client.industry || 'Legal Services',
      email: client.email || '',
      phone: client.phone || ''
    })
    setFormErrors({ email: '' })
    setIsEditModalOpen(true)
    setActiveMenuId(null)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    // Simple validations
    if (!formData.name.trim() || !formData.company.trim() || !formData.email.trim()) return

    setIsSubmitting(true)
    setFormErrors({ email: '' })

    try {
      const res = await fetch('/api/loft/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isEdit: isEditModalOpen,
          id: clientToEdit?.id
        })
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'duplicate_email') {
          setFormErrors({ email: 'A client with this email already exists' })
        } else if (data.error === 'database_migration_needed') {
          setIsAddModalOpen(false)
          setIsMigrationModalOpen(true)
        } else {
          alert(`Error saving client: ${data.error}`)
        }
      } else {
        triggerToast(isEditModalOpen ? 'Client updated successfully' : 'Client added successfully')
        setIsAddModalOpen(false)
        setIsEditModalOpen(false)
        fetchClients()
      }
    } catch (err) {
      console.error('Error submitting client form:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = async (client: Client) => {
    setActiveMenuId(null)
    const confirmed = confirm(`Are you sure you want to delete ${client.name}?`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/loft/clients?id=${client.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        triggerToast('Client deleted successfully')
        fetchClients()
      } else {
        const data = await res.json()
        alert(`Error deleting client: ${data.error}`)
      }
    } catch (err) {
      console.error('Error deleting client:', err)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'green':
        return '#16A34A'
      case 'amber':
        return '#D97706'
      case 'red':
        return '#DC2626'
      default:
        return '#16A34A'
    }
  }

  const getHealthText = (status: string) => {
    switch (status) {
      case 'green':
        return 'Healthy'
      case 'amber':
        return 'Attention'
      case 'red':
        return 'At Risk'
      default:
        return 'Healthy'
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never'
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

  // Live filter search logic
  const filteredClients = clients.filter(client => {
    const s = search.toLowerCase()
    return (
      client.name?.toLowerCase().includes(s) ||
      client.company?.toLowerCase().includes(s) ||
      client.client_id?.includes(s)
    )
  })

  const industries = [
    'Legal Services', 'Financial Advisory', 'Management Consulting', 
    'Marketing Agency', 'Accounting', 'HR & Recruitment', 
    'Technology', 'Real Estate', 'Healthcare', 
    'Architecture', 'PR & Communications', 'Other'
  ]

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
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-white font-bold text-[24px]">Clients</h1>
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-[280px]">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, company or client ID..."
                    style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                    className="w-full text-sm text-white placeholder-[#555555] rounded-[8px] border pl-11 pr-4 py-2.5 focus:outline-none focus:border-[#555555]"
                  />
                </div>

                {/* Add Client Button */}
                <button
                  onClick={handleOpenAddModal}
                  style={{ backgroundColor: '#F6FF80', color: '#000000' }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-bold text-[13px] hover:opacity-90 transition-opacity focus:outline-none"
                >
                  <Plus size={16} />
                  Add Client
                </button>
              </div>
            </div>

            {/* List / Table Area */}
            {loading ? (
              /* Loading Skeletons */
              <div className="bg-[#2A2A2A] rounded-[12px] overflow-hidden">
                <div className="bg-[#1E1E1E] p-4 flex gap-4 border-b border-[#2A2A2A]">
                  <div className="w-24 h-4 bg-[#333333] rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-[#333333] rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 py-2">
                      <div className="w-20 h-4 bg-[#333333] rounded animate-pulse" />
                      <div className="flex-1 h-4 bg-[#333333] rounded animate-pulse" />
                      <div className="w-28 h-4 bg-[#333333] rounded animate-pulse" />
                      <div className="w-20 h-4 bg-[#333333] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredClients.length === 0 ? (
              /* Empty State */
              <div className="bg-[#2A2A2A] rounded-[12px] p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                  <Users size={48} className="text-[#333333]" />
                </div>
                <h3 className="text-white font-bold text-[16px]">No clients yet</h3>
                <p className="text-[#888888] text-[14px]">Add your first client to get started</p>
                <button
                  onClick={handleOpenAddModal}
                  style={{ backgroundColor: '#F6FF80', color: '#000000' }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-bold text-[13px] hover:opacity-90 transition-opacity focus:outline-none"
                >
                  <Plus size={16} />
                  Add Client
                </button>
              </div>
            ) : (
              /* Client Table */
              <div className="bg-[#2A2A2A] rounded-[12px] overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1E1E1E]">
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase">Client ID</th>
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase">Client</th>
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase">Industry</th>
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase">Health</th>
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase font-sans">Last Interaction</th>
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase">Added</th>
                        <th className="px-6 py-4 text-[#555555] text-[11px] font-bold tracking-[1px] uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]/30">
                      {filteredClients.map(client => (
                        <tr 
                          key={client.id}
                          onClick={() => router.push(`/clients/${client.id}`)}
                          className="hover:bg-[#252525] transition-colors duration-150 cursor-pointer"
                        >
                          {/* Client ID */}
                          <td className="px-6 py-4 text-[#888888] text-[13px] font-mono">
                            {client.client_id}
                          </td>
                          {/* Client Name & Company */}
                          <td className="px-6 py-4">
                            <div className="text-white font-bold text-[14px]">{client.name}</div>
                            <div className="text-[#888888] text-[12px] mt-0.5">{client.company}</div>
                          </td>
                          {/* Industry Pill */}
                          <td className="px-6 py-4">
                            <span className="inline-block bg-[#333333] text-[#888888] text-[11px] font-semibold rounded-[4px] px-2.5 py-0.5">
                              {client.industry}
                            </span>
                          </td>
                          {/* Health status */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: getHealthColor(client.health_status) }} 
                              />
                              <span 
                                className="text-[12px] font-medium" 
                                style={{ color: getHealthColor(client.health_status) }}
                              >
                                {getHealthText(client.health_status)}
                              </span>
                            </div>
                          </td>
                          {/* Last Interaction */}
                          <td className="px-6 py-4 text-[#888888] text-[13px]">
                            {formatDate(client.last_interaction_at)}
                          </td>
                          {/* Date Added */}
                          <td className="px-6 py-4 text-[#888888] text-[13px]">
                            {formatDate(client.created_at)}
                          </td>
                          {/* Actions Three Dots */}
                          <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                              className="text-[#555555] hover:text-[#888888] transition-colors focus:outline-none"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {/* Actions Dropdown */}
                            {activeMenuId === client.id && (
                              <div 
                                ref={menuRef}
                                style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
                                className="absolute right-6 top-12 w-36 rounded-[8px] border shadow-lg py-1.5 z-50 text-left"
                              >
                                <button
                                  onClick={() => router.push(`/clients/${client.id}`)}
                                  className="w-full px-4 py-2 text-sm text-[#888888] hover:text-white hover:bg-[#252525] transition-colors text-left"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(client)}
                                  className="w-full px-4 py-2 text-sm text-[#888888] hover:text-white hover:bg-[#252525] transition-colors text-left"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClient(client)}
                                  className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#252525] transition-colors text-left border-t border-[#333333]/30 mt-1"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Add / Edit Client Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div 
            style={{ backgroundColor: '#1E1E1E' }}
            className="w-full max-w-[480px] rounded-[16px] p-8 relative flex flex-col space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-[18px]">
                {isEditModalOpen ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                }}
                className="text-[#888888] hover:text-white transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Client Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[#888888] text-[12px] font-medium">Client Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Johnson"
                  style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                  className="w-full text-sm text-white placeholder-[#555555] rounded-[8px] border px-4 py-3 focus:outline-none focus:border-[#555555]"
                />
              </div>

              {/* Company Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[#888888] text-[12px] font-medium">Company Name *</label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Apex Legal Partners"
                  style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                  className="w-full text-sm text-white placeholder-[#555555] rounded-[8px] border px-4 py-3 focus:outline-none focus:border-[#555555]"
                />
              </div>

              {/* Industry Dropdown */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[#888888] text-[12px] font-medium">Industry *</label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                  className="w-full text-sm text-white rounded-[8px] border px-4 py-3 focus:outline-none focus:border-[#555555] appearance-none"
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Email Address */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[#888888] text-[12px] font-medium">Email Address *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@company.com"
                  style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                  className="w-full text-sm text-white placeholder-[#555555] rounded-[8px] border px-4 py-3 focus:outline-none focus:border-[#555555]"
                />
                {formErrors.email && (
                  <span className="text-red-400 text-xs mt-1">{formErrors.email}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[#888888] text-[12px] font-medium">Phone Number (optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                  className="w-full text-sm text-white placeholder-[#555555] rounded-[8px] border px-4 py-3 focus:outline-none focus:border-[#555555]"
                />
              </div>

              {/* Buttons Row */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setIsEditModalOpen(false)
                  }}
                  style={{ borderColor: '#333333' }}
                  className="px-5 py-2.5 rounded-[8px] border text-[#888888] hover:text-white transition-colors text-sm font-semibold bg-transparent focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#F6FF80', color: '#000000' }}
                  className="px-5 py-2.5 rounded-[8px] font-bold text-sm hover:opacity-90 transition-opacity focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Add Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Migration Modal */}
      {isMigrationModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1100] p-4">
          <div 
            style={{ backgroundColor: '#1E1E1E' }}
            className="w-full max-w-[480px] rounded-[16px] p-8 relative flex flex-col space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[#F6FF80] font-bold text-[18px]">Database Migration Required</h2>
              <button 
                onClick={() => setIsMigrationModalOpen(false)}
                className="text-[#888888] hover:text-white transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Your existing Supabase <strong>clients</strong> table is missing the required <strong>client_id</strong> column.
            </p>
            
            <div className="bg-[#2A2A2A] rounded-[8px] p-4 text-xs font-mono text-[#888888] select-all break-all border border-[#333333]">
              alter table clients add column if not exists client_id text unique;
            </div>

            <p className="text-gray-400 text-xs">
              Please copy the statement above and run it in the SQL Editor of your Supabase Dashboard to enable client registration!
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsMigrationModalOpen(false)}
                style={{ backgroundColor: '#F6FF80', color: '#000000' }}
                className="px-5 py-2.5 rounded-[8px] font-bold text-sm hover:opacity-90 transition-opacity focus:outline-none"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div 
          style={{ backgroundColor: '#16A34A' }}
          className="fixed bottom-6 right-6 px-6 py-3 rounded-[8px] text-white font-bold text-sm shadow-lg z-[2000] animate-bounce"
        >
          {successToast}
        </div>
      )}
    </div>
  )
}
