'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare, Zap, CheckSquare } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function Sidebar({ userEmail, activeSessionId, onSelectSession, sessions }: any) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Signals', href: '/signals', icon: Zap },
    { name: 'Actions', href: '/actions', icon: CheckSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('pigeyan_sidebar_collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    }
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('pigeyan_sidebar_collapsed', String(next))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const truncateTitle = (title: string) => {
    if (title.length > 35) {
      return title.substring(0, 35) + '...'
    }
    return title
  }

  const sidebarWidth = mounted && isCollapsed ? 64 : 240

  return (
    <div 
      style={{ backgroundColor: '#1E1E1E', width: sidebarWidth }} 
      className="h-full flex flex-col flex-shrink-0 relative transition-all duration-200 ease-in-out border-r border-[#2A2A2A]"
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={handleToggle}
        style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
        className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border hover:text-[#F6FF80] transition-colors z-50 text-[#888888]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Logo */}
      <div className="p-6 flex items-center justify-center">
        {isCollapsed ? (
          <span style={{ color: '#F6FF80' }} className="font-bold text-[22px]">P</span>
        ) : (
          <h1 style={{ color: '#F6FF80' }} className="font-bold text-[22px] w-full text-left">Pigeyan</h1>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`${isCollapsed ? 'px-2' : 'px-4'} space-y-2 mt-4`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <div key={item.name} className="relative group">
              <Link href={item.href} 
                style={{ 
                  backgroundColor: isActive ? '#2A2A2A' : 'transparent',
                  color: isActive ? '#F6FF80' : '#888888'
                }}
                className={`flex items-center rounded-lg transition-colors ${
                  isCollapsed 
                    ? 'justify-center w-10 h-10 mx-auto' 
                    : 'gap-3 px-4 py-3'
                }`}
              >
                <Icon size={20} color={isActive ? '#F6FF80' : '#888888'} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
              
              {/* Tooltip on Hover when Collapsed */}
              {isCollapsed && (
                <div 
                  style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
                  className="absolute left-[72px] top-1/2 transform -translate-y-1/2 text-white text-[12px] rounded-[6px] px-[10px] py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap z-50 border shadow-lg font-medium"
                >
                  {item.name}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Recent Chats Section */}
      {isCollapsed ? (
        <div className="relative group flex justify-center mt-6">
          <div className="relative p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer flex items-center justify-center w-10 h-10 mx-auto">
            <MessageSquare size={20} color="#888888" />
            {sessions.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#F6FF80] rounded-full border border-[#1E1E1E]" />
            )}
          </div>
          
          {/* Tooltip on Hover when Collapsed */}
          <div 
            style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
            className="absolute left-[72px] top-1/2 transform -translate-y-1/2 text-white text-[12px] rounded-[6px] px-[10px] py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap z-50 border shadow-lg font-medium"
          >
            Recent Chats
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mt-6 px-4">
          <div className="text-[#555555] text-[11px] uppercase font-bold mb-3 px-2 border-t border-[#333333] pt-6">
            Recent Chats
          </div>
          <div className="space-y-1">
            {sessions.map((s: any) => {
              const isActive = activeSessionId === s.id
              return (
                <button 
                  key={s.id}
                  onClick={() => {
                    if(pathname !== '/dashboard') router.push('/dashboard')
                    onSelectSession(s.id)
                  }}
                  style={{ color: isActive ? '#F6FF80' : '#888888' }}
                  className="w-full text-left truncate px-3 py-2 rounded-lg text-sm hover:text-white hover:bg-[#2A2A2A] transition-colors"
                >
                  {truncateTitle(s.title)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Spacer if collapsed to push footer to bottom */}
      {isCollapsed && <div className="flex-1" />}

      {/* Footer / Logout */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} mt-auto border-t border-[#333333]`}>
        {!isCollapsed && userEmail && (
          <div className="text-[#888888] text-xs truncate mb-4 px-2">{userEmail}</div>
        )}
        <div className="relative group">
          <button 
            onClick={handleLogout}
            className={`flex items-center text-[#888888] hover:text-white transition-colors rounded-lg hover:bg-[#2A2A2A] ${
              isCollapsed 
                ? 'justify-center w-10 h-10 mx-auto' 
                : 'gap-3 px-4 py-2 w-full'
            }`}
          >
            <LogOut size={20} color="#888888" />
            {!isCollapsed && <span>Log out</span>}
          </button>
          
          {/* Tooltip for Logout */}
          {isCollapsed && (
            <div 
              style={{ backgroundColor: '#2A2A2A', borderColor: '#333333' }}
              className="absolute left-[72px] top-1/2 transform -translate-y-1/2 text-white text-[12px] rounded-[6px] px-[10px] py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap z-50 border shadow-lg font-medium"
            >
              Log out
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
