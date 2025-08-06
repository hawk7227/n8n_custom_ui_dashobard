"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { FaSpinner } from 'react-icons/fa';

interface LandingPageData {
  id: string | number;
  session_id: string | number;
  html_content?: string;
  css_content?: string;
  js_content?: string;
  created_at?: string;
}

interface LandingPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function LandingPage({ params }: LandingPageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle async params
  useEffect(() => {
    const getSessionId = async () => {
      const { sessionId: id } = await params;
      setSessionId(id);
    };
    getSessionId();
  }, [params]);

  useEffect(() => {
    const fetchLandingPage = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        
        // Fetch landing page data from Supabase
        const { data, error } = await supabase
          .from('landingpages')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) {
          console.error('Error fetching landing page:', error);
          setError('Landing page not found');
          return;
        }

        if (!data) {
          setError('Landing page not found');
          return;
        }

        setLandingPage(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load landing page');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchLandingPage();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600">Loading landing page...</span>
        </div>
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Not Found</h1>
          <p className="text-gray-600">The requested landing page could not be found.</p>
          <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }

  // For now, return a simple page since we don't have HTML content in the database yet
  // In the future, you can extend the database schema to include html_content, css_content, etc.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Landing Page</h1>
            <p className="text-xl opacity-90">Generated for session: {String(landingPage.session_id).slice(0, 8)}...</p>
          </div>
          
          {/* Content */}
          <div className="px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Landing Page</h2>
              <p className="text-lg text-gray-600 mb-8">
                This is a placeholder landing page for session {String(landingPage.session_id).slice(0, 8)}...
              </p>
            </div>
            
            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Responsive</h3>
                <p className="text-gray-600">Built with modern web technologies for optimal performance.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Design</h3>
                <p className="text-gray-600">Clean and modern design that converts visitors into customers.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generated</h3>
                <p className="text-gray-600">Created using advanced AI technology for optimal results.</p>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="text-center bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">Take action now and see the results for yourself.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Get Started Now
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center">
            <p className="text-gray-600">
              Generated on {landingPage.created_at ? new Date(landingPage.created_at).toLocaleDateString() : 'Unknown date'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 