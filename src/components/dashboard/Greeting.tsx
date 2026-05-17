'use client'
import { useEffect, useState } from 'react'

export default function Greeting({ user, centered = false }: { user: any, centered?: boolean }) {
  const [greeting, setGreeting] = useState('Hello')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('Good morning')
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon')
    else if (hour >= 17 && hour < 21) setGreeting('Good evening')
    else setGreeting('Working late')
  }, [])

  const firstName = user?.user_metadata?.first_name || 'there'

  return (
    <div className={centered ? "text-center" : ""}>
      <h1 className="text-white text-[32px] font-bold">
        {greeting}, {firstName}.
      </h1>
      <p style={{ color: '#888888' }} className="text-[14px] mt-2">
        Here's what's happening across your client portfolio today.
      </p>
    </div>
  )
}
