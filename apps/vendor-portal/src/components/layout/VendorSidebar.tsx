'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText, Users, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

export function VendorSidebar() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('appointments'), href: '/appointments', icon: FileText },
    { name: t('calendar'), href: '/appointments/calendar', icon: Calendar },
    { name: t('clients'), href: '/clients', icon: Users },
    { name: t('schedule'), href: '/schedule', icon: Calendar },
    { name: t('deathNotification'), href: '/wills/notify-death', icon: Bell },
    { name: t('settings'), href: '/settings/radius', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold">Memento Mori</h1>
      </div>
      <nav className="p-4 space-y-1">
        {navigation.map(item => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
