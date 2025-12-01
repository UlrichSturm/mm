'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Панель управления', href: '/', icon: LayoutDashboard },
  { name: 'Заявки', href: '/appointments', icon: FileText },
  { name: 'Календарь встреч', href: '/appointments/calendar', icon: Calendar },
  { name: 'Клиенты', href: '/clients', icon: Users },
  { name: 'Расписание', href: '/schedule', icon: Calendar },
  { name: 'Уведомление о смерти', href: '/wills/notify-death', icon: Bell },
  { name: 'Настройки', href: '/settings/radius', icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold">Memento Mori</h1>
      </div>
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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

