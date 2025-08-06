"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { supabase, Brand, LandingPage, Image } from '../../lib/supabase';
import { 
  FaUsers, 
  FaEnvelope, 
  FaSms, 
  FaEye, 
  FaImage, 
  FaChartLine, 
  FaCalendarAlt,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: 'email' | 'sms' | 'both';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  brand_name: string;
  total_recipients: number;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  emails_failed: number;
  mms_sent: number;
  mms_delivered: number;
  mms_failed: number;
  created_at: string;
}

interface DashboardStats {
  totalBrands: number;
  totalCampaigns: number;
  totalLandingPages: number;
  totalImages: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalEmailsSent: number;
  totalSmsSent: number;
  totalRecipients: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalBrands: 0,
    totalCampaigns: 0,
    totalLandingPages: 0,
    totalImages: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalEmailsSent: 0,
    totalSmsSent: 0,
    totalRecipients: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [recentBrands, setRecentBrands] = useState<Brand[]>([]);
  const [recentLandingPages, setRecentLandingPages] = useState<LandingPage[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>([]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch brands
      const { data: brands } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch landing pages
      const { data: landingPages } = await supabase
        .from('landingpages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch images
      const { data: images } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      // Calculate stats
      const totalEmailsSent = campaigns?.reduce((sum, c) => sum + (c.emails_sent || 0), 0) || 0;
      const totalSmsSent = campaigns?.reduce((sum, c) => sum + (c.mms_sent || 0), 0) || 0;
      const totalRecipients = campaigns?.reduce((sum, c) => sum + (c.total_recipients || 0), 0) || 0;
      const totalOpened = campaigns?.reduce((sum, c) => sum + (c.emails_opened || 0), 0) || 0;
      const totalClicked = campaigns?.reduce((sum, c) => sum + (c.emails_clicked || 0), 0) || 0;

      const avgOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
      const avgClickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;

      setStats({
        totalBrands: brands?.length || 0,
        totalCampaigns: campaigns?.length || 0,
        totalLandingPages: landingPages?.length || 0,
        totalImages: images?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
        completedCampaigns: campaigns?.filter(c => c.status === 'completed').length || 0,
        totalEmailsSent,
        totalSmsSent,
        totalRecipients,
        avgOpenRate: Math.round(avgOpenRate * 100) / 100,
        avgClickRate: Math.round(avgClickRate * 100) / 100
      });

      setRecentCampaigns(campaigns?.slice(0, 5) || []);
      setRecentBrands(brands || []);
      setRecentLandingPages(landingPages || []);

      // Prepare campaign performance data for charts
      const performanceData = campaigns?.map(campaign => ({
        name: campaign.campaign_name,
        sent: (campaign.emails_sent || 0) + (campaign.mms_sent || 0),
        delivered: (campaign.emails_delivered || 0) + (campaign.mms_delivered || 0),
        opened: campaign.emails_opened || 0,
        clicked: campaign.emails_clicked || 0,
        failed: (campaign.emails_failed || 0) + (campaign.mms_failed || 0)
      })) || [];

      setCampaignPerformance(performanceData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <FaEnvelope className="text-blue-500" />;
      case 'sms': return <FaSms className="text-green-500" />;
      case 'both': return <div className="flex space-x-1"><FaEnvelope className="text-blue-500" /><FaSms className="text-green-500" /></div>;
      default: return <FaEnvelope className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar 
          activeTab="dashboard" 
          setActiveTab={() => {}} 
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar 
            showSidebarToggle={true}
            onSidebarToggle={handleSidebarToggle}
          />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3">
                <FaSpinner className="animate-spin text-primary" size={24} />
                <span className="text-muted-foreground">Loading dashboard...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeTab="dashboard" 
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
          <div className="w-full max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-lg text-muted-foreground mt-1">Welcome back! Here's what's happening with your campaigns.</p>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <FaSpinner className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Brands</p>
                    <p className="text-3xl font-bold text-foreground">{formatNumber(stats.totalBrands)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-blue-500" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                    <p className="text-3xl font-bold text-foreground">{formatNumber(stats.activeCampaigns)}</p>
                    <p className="text-sm text-muted-foreground">of {formatNumber(stats.totalCampaigns)} total</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-green-500" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                    <p className="text-3xl font-bold text-foreground">{formatNumber(stats.totalEmailsSent)}</p>
                    <p className="text-sm text-muted-foreground">{formatNumber(stats.avgOpenRate)}% open rate</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <FaEnvelope className="text-purple-500" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Landing Pages</p>
                    <p className="text-3xl font-bold text-foreground">{formatNumber(stats.totalLandingPages)}</p>
                    <p className="text-sm text-muted-foreground">Pages created</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <FaEye className="text-orange-500" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Performance</h3>
                <div className="space-y-4">
                  {campaignPerformance.slice(0, 5).map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Sent: {formatNumber(campaign.sent)} | Delivered: {formatNumber(campaign.delivered)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaSms className="text-green-500" />
                      <span className="text-foreground">SMS Sent</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatNumber(stats.totalSmsSent)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaUsers className="text-blue-500" />
                      <span className="text-foreground">Total Recipients</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatNumber(stats.totalRecipients)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaImage className="text-purple-500" />
                      <span className="text-foreground">Images Uploaded</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatNumber(stats.totalImages)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaChartLine className="text-orange-500" />
                      <span className="text-foreground">Click Rate</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatNumber(stats.avgClickRate)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Campaigns */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Campaigns</h3>
                  <a href="/email-mms-campaign" className="text-sm text-primary hover:underline">View All</a>
                </div>
                <div className="space-y-3">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCampaignTypeIcon(campaign.campaign_type)}
                        <div>
                          <p className="font-medium text-foreground">{campaign.campaign_name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.brand_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(campaign.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Landing Pages */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Landing Pages</h3>
                  <a href="/landing-pages" className="text-sm text-primary hover:underline">View All</a>
                </div>
                <div className="space-y-3">
                  {recentLandingPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaEye className="text-orange-500" />
                        <div>
                          <p className="font-medium text-foreground">
                            {page.name || `Landing Page #${String(page.id).slice(-8)}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {page.brand || 'No brand'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => window.open(`/landing/${page.session_id}`, '_blank')}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="View Landing Page"
                        >
                          <FaExternalLinkAlt size={14} />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">
                          {page.created_at ? formatDate(page.created_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Brands */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Brands</h3>
                <a href="/brands" className="text-sm text-primary hover:underline">View All</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBrands.map((brand) => (
                  <div key={brand.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{brand.brand_name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {brand.brand_content}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => window.open(`/brands`, '_blank')}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit Brand"
                        >
                          <FaEdit size={14} />
                        </button>
                      </div>
                    </div>
                    {brand.product_link && (
                      <a
                        href={brand.product_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
                      >
                        <FaExternalLinkAlt size={12} className="mr-1" />
                        View Product
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 