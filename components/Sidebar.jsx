'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MousePointer,
  Store,
  UserPlus,
  TrendingUp,
  Users as UsersIcon,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Website Visits', href: '/website-visits', icon: MousePointer },
  { name: 'Store Visits', href: '/store-visits', icon: Store },
  { name: 'Login/Signup', href: '/login-signup', icon: UserPlus },
  { name: 'Funnel Analytics', href: '/funnel-analytics', icon: TrendingUp },
  { name: 'Contact Journey', href: '/contact-journey', icon: UsersIcon },
  { name: 'User Management', href: '/user-management', icon: Settings }
];

export default function Sidebar({ user, currentPath, isOpen }) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="h-full overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}
    </>
  );
}