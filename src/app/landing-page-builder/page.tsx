"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaUser, FaRobot, FaSpinner, FaEye, FaRedo, FaArrowLeft, FaExternalLinkAlt, FaEyeSlash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function LandingPageBuilderPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI landing page builder. Describe the landing page you want to create and I\'ll help you build it!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isLongRequest, setIsLongRequest] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [brandName, setBrandName] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if there's a session parameter in the URL
    const sessionParam = searchParams.get('session');
    
    if (sessionParam) {
      // Load existing session
      setIsLoadingSession(true);
      loadExistingSession(sessionParam);
    } else {
      // Generate or retrieve a unique session key for the chat session
      let key = sessionStorage.getItem('landing_builder_session_key');
      if (!key) {
        key = uuidv4();
        sessionStorage.setItem('landing_builder_session_key', key);
      }
      setSessionKey(key as string);
    }
  }, [searchParams, loadExistingSession]);

  // Function to load existing session from Supabase
  const loadExistingSession = useCallback(async (sessionId: string) => {
    try {
      // Check if session exists in Supabase
      const { data, error } = await supabase
        .from('landingpages')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !data) {
        console.log('Session not found in database, redirecting to landing pages');
        window.location.href = '/landing-pages';
        return;
      }

      // Session exists, check if it has HTML content before setting up preview
      setSessionKey(sessionId);
      
      // Set brand name if available
      if (data.brand) {
        setBrandName(data.brand);
      }
      
      // Only set up preview if there's actual HTML content
      if (data.html_code && data.html_code.trim() !== '' && data.html_code.length > 10) {
        const landingPageUrl = `https://landing-page-bulder.vercel.app/landing/${sessionId}`;
        setPreviewUrl(landingPageUrl);
        setShowPreview(true);
        setIsPreviewVisible(true);
        
        // Add a message indicating the session was loaded with preview
        setMessages([
          {
            id: '1',
            text: `Session loaded! I found an existing landing page for session ${sessionId.slice(0, 8)}... You can continue building or start a new conversation.`,
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages([
          { 
            id: '1',
            text: `Welcome to the landing page builder${brandName ? ` for ${brandName}` : ''}! Describe the landing page you want to create and I'll help you build it!`,
            sender: 'bot',
            timestamp: new Date()
          }]);
        }
        
    } catch (error) {
      console.error('Error loading session:', error);
      setSessionKey(sessionId);
    } finally {
      setIsLoadingSession(false);
    }
  }, [brandName]);



  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !sessionKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsLongRequest(false);

    // Set a timer to show long request message after 1 minute
    const longRequestTimer = setTimeout(() => {
      setIsLongRequest(true);
    }, 60000); // 1 minute

    try {
      console.log('Sending request to:', 'https://evenbetterbuy.app.n8n.cloud/webhook/landing-page-generator');
      console.log('Request payload:', { prompt: userMessage.text, session: sessionKey });
      
      // Create a timeout promise (10 minutes = 600000ms)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - the AI service is taking too long to respond. Please try again.')), 600000);
      });

      // Create the fetch promise with better error handling
      const fetchPromise = fetch('https://evenbetterbuy.app.n8n.cloud/webhook/landing-page-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.text,
          session: sessionKey,
        }),
      }).catch(fetchError => {
        console.error('Fetch error details:', fetchError);
        // Provide more specific error messages based on the error type
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to connect to the AI service. Please check your internet connection and try again.');
        } else if (fetchError.name === 'TypeError' && fetchError.message.includes('CORS')) {
          throw new Error('CORS error: The AI service is not allowing requests from this domain. Please contact support.');
        } else {
          throw new Error(`Network error: ${fetchError.message || 'Unknown network error occurred'}`);
        }
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Full API Response:', responseData);
      const data = responseData?.data;
      console.log('Extracted data:', data);
      const botText = data?.response || 'Sorry, I did not understand that.';
      console.log('Bot text:', botText);
      
      // Handle landing page preview based on is_landing_page_live flag
      if (data?.is_landing_page_live === true && data?.landing_page_url) {
        // Use the provided landing page URL from the API response
        setPreviewUrl(data.landing_page_url);
        setShowPreview(true);
        setIsPreviewLoading(true);
        
        // Animate preview appearance
        setTimeout(() => {
          setIsPreviewVisible(true);
        }, 100);
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', error);
      
      // Check if it's a timeout or network error and provide a user-friendly message
      let errorMessage = 'The AI service timed out, but your landing page should still be updated. Please refresh the preview or reload the page to see the latest changes.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
          errorMessage = "The AI service is taking longer than expected to respond, but don't worry! Your landing page should still be updated. Try refreshing the preview or reloading the page to see the latest changes.";
        } else if (error.message.includes('Request timeout')) {
          errorMessage = "The AI service timed out, but your landing page should still be updated. Please refresh the preview or reload the page to see the latest changes.";
        }
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
      clearTimeout(longRequestTimer); // Clear the timer
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleIframeLoad = () => {
    setIsPreviewLoading(false);
  };

  const handleRefreshPreview = () => {
    if (!previewUrl) return;
    setIsPreviewLoading(true);
    // Force iframe to reload
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleOpenInNewTab = () => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank');
  };

  const handleTogglePreview = () => {
    if (showPreview) {
      setIsPreviewVisible(!isPreviewVisible);
    }
  };

  const handleGoBack = () => {
    window.location.href = '/dashboard';
  };

  // Show loading state while checking session
  if (isLoadingSession) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-primary" size={24} />
          <span className="text-muted-foreground">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-background transition-all duration-500 ease-in-out ${
      showPreview && isPreviewVisible ? 'gap-0' : 'gap-0'
    }`}>
      {/* Left Panel - Chatbot */}
      <div className={`flex flex-col border-r border-border transition-all duration-500 ease-in-out ${
        showPreview && isPreviewVisible ? 'w-1/2' : 'w-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoBack}
              className="w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors duration-200"
              title="Go back"
            >
              <FaArrowLeft size={12} className="text-muted-foreground" />
            </button>
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <FaRobot className="text-primary-foreground" size={12} />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                {brandName ? (
                  <>
                    <span className="text-primary">{brandName}</span>
                    <span className="text-muted-foreground"> - Landing Page Builder</span>
                  </>
                ) : (
                  'Landing Page Builder'
                )}
              </h1>
              <p className="text-xs text-muted-foreground">
                {brandName ? `AI-powered landing page creation for ${brandName}` : 'AI-powered landing page creation'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Toggle Preview Button */}
            {showPreview && (
              <button
                onClick={handleTogglePreview}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/50 rounded-lg transition-all duration-200"
                title={isPreviewVisible ? "Hide preview" : "Show preview"}
              >
                {isPreviewVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                <span className="hidden sm:inline">{isPreviewVisible ? 'Hide' : 'Show'}</span>
              </button>
            )}

          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {message.sender === 'user' ? (
                    <FaUser size={14} />
                  ) : (
                    <FaRobot size={14} />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground border border-border'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <FaRobot size={14} />
                </div>
                <div className="bg-card text-foreground border border-border rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin" size={14} />
                    <span className="text-sm text-muted-foreground">
                      {isLongRequest 
                        ? "AI response is taking a while, please wait and be patient..." 
                        : "AI is thinking..."
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your landing page..."
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Right Panel - Preview */}
      {showPreview && isPreviewVisible && (
        <div className="w-1/2 flex flex-col animate-in slide-in-from-right duration-500">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-2 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <FaEye className="text-white" size={12} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Live Preview</h2>
                <p className="text-xs text-muted-foreground">Real-time landing page preview</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/50 rounded-lg transition-all duration-200"
                title="Open in new tab"
              >
                <FaExternalLinkAlt size={14} />
                <span className="hidden sm:inline">Open</span>
              </button>
              <button
                onClick={handleRefreshPreview}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/50 rounded-lg transition-all duration-200"
                title="Refresh preview"
              >
                <FaRedo size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="flex-1 relative bg-gray-100">
            {isPreviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-primary" size={20} />
                  <span className="text-muted-foreground">Loading preview...</span>
                </div>
              </div>
            )}
            {previewUrl && (
              <iframe
                id="preview-iframe"
                src={previewUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                title="Landing Page Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 