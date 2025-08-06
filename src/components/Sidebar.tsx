"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaUserCircle, FaBars, FaTachometerAlt, FaTools, FaSignOutAlt, FaComments, FaLandmark, FaTag, FaImage, FaRocket, FaChartLine } from 'react-icons/fa';
import { useAuth } from './PasswordGate';

const tabs = [
  { name: 'Dashboard', key: 'dashboard', icon: FaTachometerAlt, path: '/dashboard' },
  { name: 'Tools', key: 'tools', icon: FaTools, path: '/tools' },
  { name: 'Brands', key: 'brands', icon: FaTag, path: '/brands' },
  { name: 'Chatbot', key: 'chatbot', icon: FaComments, path: '/chatbot' },
  { name: 'Landing Pages', key: 'landing-pages', icon: FaLandmark, path: '/landing-pages' },
  { name: 'Images', key: 'images', icon: FaImage, path: '/images' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onToggle }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { onLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Use external state if provided, otherwise use internal state
  const sidebarOpen = isOpen !== undefined ? isOpen : open;
  const setSidebarOpen = onToggle || (() => setOpen(!open));

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/tools') return 'tools';
    if (pathname === '/launch-campaign') return 'launch-campaign';
    if (pathname === '/email-mms-results') return 'email-mms-results';
    if (pathname === '/brands') return 'brands';
    if (pathname === '/chatbot') return 'chatbot';
    if (pathname === '/landing-pages') return 'landing-pages';
    if (pathname === '/images') return 'images';
    if (pathname === '/results') return 'results';
    if (pathname === '/logs') return 'logs';
    return 'dashboard';
  };

  // Listen for sidebar toggle events from navbar
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      if (onToggle) {
        onToggle();
      } else {
        setOpen(event.detail);
      }
    };

    const handleLogout = () => {
      if (typeof onLogout === 'function') {
        onLogout();
      }
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    window.addEventListener('logout', handleLogout as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
      window.removeEventListener('logout', handleLogout as EventListener);
    };
  }, [onToggle, onLogout]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen()}
        />
      )}
      
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-screen w-64 max-w-[280px] bg-card/95 backdrop-blur-md border-r border-border flex flex-col shadow-2xl transition-all duration-500 ease-out
          ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} md:translate-x-0 md:opacity-100 md:w-56 lg:w-64 md:max-w-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-br from-background to-card border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-foreground font-bold text-lg">Admin Panel</h1>
              <p className="text-muted-foreground text-xs">Management Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Navigation
              </h4>
            </div>
            
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              const isActive = getActiveTab() === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    router.push(tab.path);
                    // Close sidebar on mobile when tab is clicked
                    if (window.innerWidth < 768) {
                      setSidebarOpen();
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-md shadow-primary/20 border border-primary/20' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                    }`}
                >
                  <div className={`p-1.5 rounded-md transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground'
                  }`}>
                    <IconComponent size={14} />
                  </div>
                  <span className="font-medium text-sm">{tab.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 opacity-0 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'group-hover:opacity-100'
                  }`}></div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer with Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-300 group hover:bg-destructive/10 hover:text-destructive"
          >
            <div className="p-1.5 rounded-md transition-all duration-300 bg-muted text-muted-foreground group-hover:bg-destructive group-hover:text-destructive-foreground">
              <FaSignOutAlt size={14} />
            </div>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
