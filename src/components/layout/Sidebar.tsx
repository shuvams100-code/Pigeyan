'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BarChart2, Settings, LogOut } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ backgroundColor: '#1E1E1E', width: 240 }} className="h-full flex flex-col flex-shrink-0">
      <div className="p-6">
        <h1 style={{ color: '#F6FF80' }} className="font-bold text-[22px]">Pigeyan</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href} 
              style={{ 
                backgroundColor: isActive ? '#2A2A2A' : 'transparent',
                color: isActive ? '#F6FF80' : '#888888'
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            >
              <Icon size={20} color={isActive ? '#F6FF80' : '#888888'} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-[#333333]">
        <div className="text-[#888888] text-xs truncate mb-4 px-2">{userEmail}</div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-[#888888] hover:text-white transition-colors rounded-lg hover:bg-[#2A2A2A]"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
