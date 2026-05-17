import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ClientsClient from './ClientsClient'
import { Suspense } from 'react'

export default async function ClientsPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">Loading clients...</div>}>
      <ClientsClient user={session.user} />
    </Suspense>
  )
}
