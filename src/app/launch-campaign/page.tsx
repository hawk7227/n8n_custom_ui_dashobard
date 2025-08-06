'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaRocket, FaPlay, FaEye, FaEdit, FaTrash, FaSpinner, FaFilter, FaSearch, FaSort } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';


interface Campaign {
  id: string;
  campaign_name: string;
  campaign_description: string;
  campaign_type: 'email' | 'sms' | 'both';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  brand_id: string;
  brand_name: string;
  email_subject: string;
  email_body: string;
  send_email_as_image: boolean;
  mms_text_content: string;
  mms_image_url: string;
  selected_campaign_filter: string;
  total_recipients: number;
  created_by: string;
  tags: string[];
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  mms_sent: number;
  mms_delivered: number;
  created_at: string;
  updated_at: string;
}

export default function LaunchCampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLaunching, setIsLaunching] = useState<string | null>(null);



  // Fetch campaigns from Supabase
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return;
      }

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.email_subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.campaign_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle campaign launch
  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      setIsLaunching(campaignId);
      
      // Find the campaign
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        alert('Campaign not found');
        return;
      }

      // Update campaign status to active
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Error updating campaign status:', updateError);
        alert('Error launching campaign');
        return;
      }

      // Send campaign via webhook
      const response = await fetch('https://evenbetterbuy.app.n8n.cloud/webhook/launch-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          campaign_name: campaign.campaign_name,
          campaign_type: campaign.campaign_type,
          brand_name: campaign.brand_name,
          email_subject: campaign.email_subject,
          email_body: campaign.email_body,
          send_email_as_image: campaign.send_email_as_image,
          mms_text_content: campaign.mms_text_content,
          mms_image_url: campaign.mms_image_url,
          total_recipients: campaign.total_recipients,
          selected_campaign_filter: campaign.selected_campaign_filter
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Campaign launch response:', result);

      // Refresh campaigns list
      await fetchCampaigns();
      
      alert('Campaign launched successfully!');
      
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('Error launching campaign. Please try again.');
    } finally {
      setIsLaunching(null);
    }
  };

  // Handle campaign edit
  const handleEditCampaign = (campaignId: string) => {
    router.push(`/email-mms-campaign?id=${campaignId}`);
  };

  // Handle campaign view
  const handleViewCampaign = (campaignId: string) => {
    router.push(`/email-mms-results?id=${campaignId}`);
  };

  // Handle campaign delete
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Error deleting campaign:', error);
        alert('Error deleting campaign');
        return;
      }

      // Refresh campaigns list
      await fetchCampaigns();
      alert('Campaign deleted successfully');
      
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Error deleting campaign. Please try again.');
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'draft':
        return 'text-gray-600 dark:text-gray-400';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'completed':
        return 'text-blue-600 dark:text-blue-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Launch Campaign</h1>
            <p className="text-muted-foreground">
              Select and launch your email/MMS campaigns to reach your audience
            </p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns by name, brand, or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <FaFilter className="text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <FaSort className="text-muted-foreground" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Types</option>
                    <option value="email">Email</option>
                    <option value="sms">MMS</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaRocket className="text-green-600" />
                  Campaigns ({filteredCampaigns.length})
                </div>
                <Button
                  onClick={() => router.push('/email-mms-campaign')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FaRocket className="mr-2" />
                  Create New Campaign
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaRocket className="text-2xl text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Create your first campaign to get started'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                    <Button
                      onClick={() => router.push('/email-mms-campaign')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <FaRocket className="mr-2" />
                      Create Campaign
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Campaign</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Brand</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Recipients</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Performance</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-foreground">{campaign.campaign_name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {campaign.email_subject || 'No subject'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium">{campaign.brand_name}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="capitalize">
                              {campaign.campaign_type}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={getStatusBadgeVariant(campaign.status)} className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium">{campaign.total_recipients}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {campaign.campaign_type === 'email' || campaign.campaign_type === 'both' ? (
                                <div>
                                  <div>Sent: {campaign.emails_sent}</div>
                                  <div>Delivered: {campaign.emails_delivered}</div>
                                </div>
                              ) : (
                                <div>
                                  <div>Sent: {campaign.mms_sent}</div>
                                  <div>Delivered: {campaign.mms_delivered}</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-muted-foreground">
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {campaign.status === 'draft' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleLaunchCampaign(campaign.id)}
                                  disabled={isLaunching === campaign.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isLaunching === campaign.id ? (
                                    <FaSpinner className="animate-spin" />
                                  ) : (
                                    <FaPlay />
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCampaign(campaign.id)}
                              >
                                <FaEye />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCampaign(campaign.id)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 