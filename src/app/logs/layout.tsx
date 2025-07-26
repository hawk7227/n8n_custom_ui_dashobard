"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState('logs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    } else if (tab === 'results') {
      router.push('/results');
    } else if (tab === 'logs') {
      router.push('/logs');
    }
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar */}
        <Navbar 
          showSidebarToggle={true}
          onSidebarToggle={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 