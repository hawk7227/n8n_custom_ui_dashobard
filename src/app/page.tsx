"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ToolsTab from '../components/ToolsTab';
import Navbar from '../components/Navbar';

export default function Home(props: any) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'results') {
      router.push('/results');
    }
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Listen for tab changes from other pages
  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('setActiveTab', handleSetActiveTab as EventListener);
    return () => {
      window.removeEventListener('setActiveTab', handleSetActiveTab as EventListener);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
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
          {activeTab === 'dashboard' && (
            <section className="w-full max-w-4xl mx-auto">
              <div className="bg-card rounded-xl shadow-sm border border-border p-8">
                <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to the Dashboard</h1>
                <p className="text-lg text-muted-foreground mb-8">This is your main dashboard area. Add widgets, stats, or charts here!</p>
                
                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20">
                    <h3 className="text-lg font-semibold text-primary mb-2">Quick Stats</h3>
                    <p className="text-muted-foreground">View your key metrics and performance indicators</p>
                  </div>
                  
                  <div className="bg-green-500/5 dark:bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Recent Activity</h3>
                    <p className="text-muted-foreground">Check your latest activities and updates</p>
                  </div>
                  
                  <div className="bg-purple-500/5 dark:bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">Analytics</h3>
                    <p className="text-muted-foreground">Explore detailed analytics and insights</p>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {activeTab === 'tools' && (
            <ToolsTab />
          )}
        </main>
      </div>
    </div>
  );
}
