'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#1E1E1E] flex items-center justify-center font-sans">
      <div style={{ backgroundColor: '#2A2A2A' }} className="w-[400px] rounded-[16px] p-[40px]">
        <h1 style={{ color: '#F6FF80' }} className="text-center font-bold text-[28px] mb-2">Pigeyan</h1>
        <p style={{ color: '#888888' }} className="text-center text-[13px] mb-8">Client intelligence platform</p>
        
        <form onSubmit={handleSignIn} className="flex flex-col">
          <label style={{ color: '#888888' }} className="text-[12px] mb-1">Email</label>
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
            placeholder="••••••••"
            required
          />

          <button 
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#F6FF80', color: '#000000' }}
            className="mt-6 rounded-[8px] p-[14px] font-bold text-[14px] disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" /> : 'Sign In'}
          </button>

          {error && (
            <div style={{ color: '#DC2626' }} className="text-center text-[12px] mt-4">
              {error}
            </div>
          )}
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-[#333333]"></div>
          <span style={{ color: '#555555' }} className="px-3 text-[13px]">or</span>
          <div className="flex-1 border-t border-[#333333]"></div>
        </div>

        <div style={{ color: '#888888' }} className="text-center text-[13px]">
          Create an account?{' '}
          <Link href="/signup" style={{ color: '#F6FF80' }} className="hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
