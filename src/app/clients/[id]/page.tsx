import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ClientProfileClient from './ClientProfileClient'
import { Suspense } from 'react'

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">Loading profile...</div>}>
      <ClientProfileClient clientId={params.id} user={session.user} />
    </Suspense>
  )
}
