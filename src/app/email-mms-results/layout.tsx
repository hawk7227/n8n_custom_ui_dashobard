'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function EmailMMSResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState('tools');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 