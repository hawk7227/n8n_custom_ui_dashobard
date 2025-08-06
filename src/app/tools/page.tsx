"use client";

import React from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ToolsTab from '../../components/ToolsTab';

export default function Tools() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeTab="tools" 
        setActiveTab={() => {}} 
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
          <ToolsTab />
        </main>
      </div>
    </div>
  );
} 