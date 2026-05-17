import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import Greeting from '@/components/dashboard/Greeting'
import ChatInterface from '@/components/dashboard/ChatInterface'
import ActionItems from '@/components/dashboard/ActionItems'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen w-full bg-[#1E1E1E] text-white overflow-hidden font-sans">
      <Sidebar userEmail={session.user.email} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl space-y-8">
            <Greeting user={session.user} />
            <ChatInterface agencyId={session.user.id} />
            <ActionItems agencyId={session.user.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
