"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LaunchCampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState('launch-campaign');

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 