'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Settings, User } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-[#0F172A] min-h-screen border-r border-[#1E293B]">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-2xl font-bold text-[#0D7377] tracking-tight">Pigeyan</h1>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#0D7377] text-white' 
                    : 'text-[#64748B] hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#1E293B] cursor-pointer transition-colors text-white">
            <div className="h-8 w-8 rounded-full bg-[#1E293B] flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-[#64748B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Agency User</p>
              <p className="text-xs text-[#64748B] truncate">user@agency.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
