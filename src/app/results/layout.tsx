"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState('results');
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      router.push('/');
    } else if (tab === 'tools') {
      router.push('/');
      // Set the tools tab on the main page
      setTimeout(() => {
        const event = new CustomEvent('setActiveTab', { detail: 'tools' });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 