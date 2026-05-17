'use client'
import { Bell, Home } from 'lucide-react'

export default function TopBar({ onHome, showHome, sessionTitle }: { onHome?: () => void, showHome?: boolean, sessionTitle?: string }) {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div style={{ height: 64, backgroundColor: '#1E1E1E' }} className="flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-4">
        {showHome && (
          <>
            <button onClick={onHome} className="text-[#888888] hover:text-white transition-colors p-2 rounded hover:bg-[#2A2A2A]">
              <Home size={20} />
            </button>
            <h2 className="text-white font-bold text-[18px]">
              {sessionTitle && sessionTitle.length > 35 ? sessionTitle.substring(0, 35) + '...' : sessionTitle}
            </h2>
          </>
        )}
      </div>
      <div className="flex-1 flex justify-end items-center gap-6">
        <span className="text-[#888888] text-sm">{dateString}</span>
        <button className="text-[#888888] hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </div>
  )
}
