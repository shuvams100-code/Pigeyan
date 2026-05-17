'use client'
import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function TopBar() {
  const pathname = usePathname()
  
  // Format: "Monday, 19 May 2026"
  const today = new Date()
  const dateString = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // get title from path
  let title = 'Dashboard'
  if (pathname === '/clients') title = 'Clients'
  if (pathname === '/reports') title = 'Reports'
  if (pathname === '/settings') title = 'Settings'

  return (
    <div style={{ height: 64, backgroundColor: '#1E1E1E' }} className="flex items-center justify-between px-8 flex-shrink-0">
      <h2 className="text-white font-bold text-[18px]">{title}</h2>
      <div className="flex items-center gap-6">
        <span className="text-[#888888] text-sm">{dateString}</span>
        <button className="text-[#888888] hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </div>
  )
}
