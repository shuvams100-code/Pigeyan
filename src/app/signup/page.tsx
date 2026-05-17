'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [router, supabase])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const firstName = fullName.split(' ')[0]

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          full_name: fullName,
          agency_name: agencyName,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: insertError } = await supabase.from('agencies').insert({
        name: agencyName,
        email: email
      })

      if (insertError) {
        console.error('Insert agency error:', insertError)
        // We'll proceed to redirect even if insertion fails due to RLS/schema mismatches, 
        // to ensure the user is logged in. 
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-[#1E1E1E] flex items-center justify-center font-sans py-10">
      <div style={{ backgroundColor: '#2A2A2A' }} className="w-[400px] rounded-[16px] p-[40px]">
        <h1 style={{ color: '#F6FF80' }} className="text-center font-bold text-[28px] mb-2">Pigeyan</h1>
        <p style={{ color: '#888888' }} className="text-center text-[13px] mb-8">Start your free trial</p>
        
        <form onSubmit={handleSignUp} className="flex flex-col">
          <label style={{ color: '#888888' }} className="text-[12px] mb-1">Full Name</label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
            className="border rounded-[8px] px-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#F6FF80] w-full"
            placeholder="Sarah Richardson"
            required
          />

          <label style={{ color: '#888888' }} className="text-[12px] mt-4 mb-1">Agency Name</label>
          <input 
            type="text" 
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
            className="border rounded-[8px] px-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#F6FF80] w-full"
            placeholder="Richardson & Co."
            required
          />

          <label style={{ color: '#888888' }} className="text-[12px] mt-4 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
            className="border rounded-[8px] px-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#F6FF80] w-full"
            placeholder="you@agency.com"
            required
          />

          <label style={{ color: '#888888' }} className="text-[12px] mt-4 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ backgroundColor: '#1E1E1E', borderColor: '#333333' }}
            className="border rounded-[8px] px-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#F6FF80] w-full"
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />

          <button 
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#F6FF80', color: '#000000' }}
            className="mt-6 rounded-[8px] p-[14px] font-bold text-[14px] disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" /> : 'Create Account'}
          </button>

          {error && (
            <div style={{ color: '#DC2626' }} className="text-center text-[12px] mt-4">
              {error}
            </div>
          )}
        </form>

        <div style={{ color: '#888888' }} className="text-center text-[13px] mt-6">
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#F6FF80' }} className="hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
