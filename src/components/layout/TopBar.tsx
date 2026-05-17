'use client';

import { usePathname } from 'next/navigation';

export default function TopBar() {
  const pathname = usePathname();
  
  // Format pathname into a title (e.g., /dashboard -> Dashboard)
  const title = pathname === '/' 
    ? 'Dashboard' 
    : pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-8 shadow-sm">
      <h2 className="text-xl font-semibold text-[#1E293B]">{title}</h2>
    </header>
  );
}
