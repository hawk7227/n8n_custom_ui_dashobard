"use client";

import React, { useState, useEffect } from 'react';
import { FaUser, FaBars, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../lib/theme-context';
import { useAuth } from './PasswordGate';

interface NavbarProps {
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

export default function Navbar({ onSidebarToggle, showSidebarToggle = true }: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { onLogout } = useAuth();

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Dispatch custom event for sidebar components to listen to
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: newState }));
    
    // Call parent handler if provided
    if (onSidebarToggle) {
      onSidebarToggle();
    }
  };

  // Handle logout
  const handleLogout = () => {
    setShowUserMenu(false);
    
    // Dispatch custom event for logout
    window.dispatchEvent(new CustomEvent('logout'));
    
    // Call auth context logout
    onLogout();
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm backdrop-blur-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
            {showSidebarToggle && (
              <button
                onClick={handleSidebarToggle}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200 md:hidden"
                aria-label="Toggle sidebar"
              >
                <FaBars size={18} />
              </button>
            )}
            
           
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 relative group"
              aria-label="Toggle theme"
            >
              <div className="relative">
                <FaSun 
                  size={18} 
                  className={`transition-all duration-300 ${
                    theme === 'light' 
                      ? 'opacity-100 rotate-0 scale-100' 
                      : 'opacity-0 -rotate-90 scale-0 absolute inset-0'
                  }`}
                />
                <FaMoon 
                  size={18} 
                  className={`transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'opacity-100 rotate-0 scale-100' 
                      : 'opacity-0 rotate-90 scale-0 absolute inset-0'
                  }`}
                />
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <FaUser size={14} className="text-primary-foreground" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground">Admin</span>
              </button>
              
              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">Administrator</p>
                    <p className="text-xs text-muted-foreground">admin@company.com</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <FaSignOutAlt size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 