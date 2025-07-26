'use client';

import React from 'react';
import { FaChartBar, FaRobot, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: FaChartBar, label: 'Results', href: '/results' },
    { icon: FaRobot, label: 'AI Flows', href: '/' },
    { icon: FaCog, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card text-card-foreground p-6 flex flex-col shadow-xl border-r border-border">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">AI Campaign</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="text-xl" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div>
              <div className="text-sm font-medium text-foreground">User Name</div>
              <div className="text-xs text-muted-foreground">user@example.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
