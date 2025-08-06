'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaChartLine, FaEye, FaEnvelope, FaImage, FaSpinner, FaFilter, FaSearch, FaSort, FaDownload, FaRedo } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  emails_failed: number;
  emails_pending: number;
  mms_sent: number;
  mms_delivered: number;
  mms_failed: number;
  mms_pending: number;
  created_at: string;
  updated_at: string;
}

interface CampaignDetail {
  id: string;
  campaign_name: string;
  brand_name: string;
  campaign_type: string;
  status: string;
  total_recipients: number;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  emails_failed: number;
  emails_pending: number;
  mms_sent: number;
  mms_delivered: number;
  mms_failed: number;
  mms_pending: number;
  created_at: string;
  email_subject: string;
  mms_text_content: string;
}

export default function EmailMMSResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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

  // Fetch campaign details by ID
  const fetchCampaignDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching campaign detail:', error);
        return;
      }

      setSelectedCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Load campaign detail if ID is provided in URL
  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetail(campaignId);
    } else {
      setSelectedCampaign(null);
    }
  }, [campaignId]);

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.email_subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.campaign_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    router.push(`/email-mms-results?id=${campaignId}`);
  };

  // Handle back to list
  const handleBackToList = () => {
    router.push('/email-mms-results');
  };

  // Calculate email metrics
  const getEmailMetrics = (campaign: Campaign) => {
    const total = campaign.emails_sent + campaign.emails_pending;
    const delivered = campaign.emails_delivered;
    const opened = campaign.emails_opened;
    const clicked = campaign.emails_clicked;
    const failed = campaign.emails_failed;
    const pending = campaign.emails_pending;

    return {
      total,
      delivered,
      opened,
      clicked,
      failed,
      pending,
      deliveryRate: total > 0 ? (delivered / total * 100).toFixed(1) : '0',
      openRate: delivered > 0 ? (opened / delivered * 100).toFixed(1) : '0',
      clickRate: opened > 0 ? (clicked / opened * 100).toFixed(1) : '0'
    };
  };

  // Calculate MMS metrics
  const getMMSMetrics = (campaign: Campaign) => {
    const total = campaign.mms_sent + campaign.mms_pending;
    const delivered = campaign.mms_delivered;
    const failed = campaign.mms_failed;
    const pending = campaign.mms_pending;

    return {
      total,
      delivered,
      failed,
      pending,
      deliveryRate: total > 0 ? (delivered / total * 100).toFixed(1) : '0'
    };
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

  // Show campaign detail view
  if (selectedCampaign) {
    const emailMetrics = getEmailMetrics(selectedCampaign as Campaign);
    const mmsMetrics = getMMSMetrics(selectedCampaign as Campaign);

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FaArrowLeft className="text-sm" />
                  <span className="text-sm font-medium">Back to Results</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FaChartLine className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-lg text-foreground">Campaign Analytics</span>
              </div>
              <div className="w-24"></div>
            </div>
          </div>
        </div>

        {/* Campaign Detail Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading campaign details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Campaign Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaChartLine className="text-blue-600" />
                        <span>{selectedCampaign.campaign_name}</span>
                        <Badge variant={getStatusBadgeVariant(selectedCampaign.status)} className={getStatusColor(selectedCampaign.status)}>
                          {selectedCampaign.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FaDownload className="mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchCampaigns}>
                          <FaRedo className="mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Brand</Label>
                        <p className="font-medium">{selectedCampaign.brand_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Campaign Type</Label>
                        <Badge variant="outline" className="capitalize">
                          {selectedCampaign.campaign_type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Total Recipients</Label>
                        <p className="font-medium">{selectedCampaign.total_recipients}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Analytics */}
                {(selectedCampaign.campaign_type === 'email' || selectedCampaign.campaign_type === 'both') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-600" />
                        Email Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{emailMetrics.total}</div>
                          <div className="text-sm text-muted-foreground">Total Sent</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{emailMetrics.delivered}</div>
                          <div className="text-sm text-muted-foreground">Delivered</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{emailMetrics.opened}</div>
                          <div className="text-sm text-muted-foreground">Opened</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{emailMetrics.clicked}</div>
                          <div className="text-sm text-muted-foreground">Clicked</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{emailMetrics.failed}</div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{emailMetrics.pending}</div>
                          <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{emailMetrics.deliveryRate}%</div>
                          <div className="text-sm text-muted-foreground">Delivery Rate</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{emailMetrics.openRate}%</div>
                          <div className="text-sm text-muted-foreground">Open Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* MMS Analytics */}
                {(selectedCampaign.campaign_type === 'sms' || selectedCampaign.campaign_type === 'both') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FaImage className="text-blue-600" />
                        MMS Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{mmsMetrics.total}</div>
                          <div className="text-sm text-muted-foreground">Total Sent</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{mmsMetrics.delivered}</div>
                          <div className="text-sm text-muted-foreground">Delivered</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{mmsMetrics.failed}</div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{mmsMetrics.pending}</div>
                          <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{mmsMetrics.deliveryRate}%</div>
                          <div className="text-sm text-muted-foreground">Delivery Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Campaign Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCampaign.email_subject && (
                        <div>
                          <Label className="text-sm font-medium">Email Subject</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.email_subject}</p>
                        </div>
                      )}
                      {selectedCampaign.mms_text_content && (
                        <div>
                          <Label className="text-sm font-medium">MMS Content</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.mms_text_content}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(selectedCampaign.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show campaigns list view
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Email/MMS Campaign Results</h1>
            <p className="text-muted-foreground">
              View detailed analytics and performance metrics for your email and MMS campaigns
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
                  <FaChartLine className="text-blue-600" />
                  Campaign Results ({filteredCampaigns.length})
                </div>
                <Button
                  onClick={fetchCampaigns}
                  variant="outline"
                  size="sm"
                >
                  <FaRedo className="mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaChartLine className="text-2xl text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No campaigns have been created yet'
                    }
                  </p>
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
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email Metrics</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">MMS Metrics</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCampaigns.map((campaign) => {
                        const emailMetrics = getEmailMetrics(campaign);
                        const mmsMetrics = getMMSMetrics(campaign);
                        
                        return (
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
                              {(campaign.campaign_type === 'email' || campaign.campaign_type === 'both') ? (
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Sent:</span>
                                    <span className="font-medium">{emailMetrics.total}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Delivered:</span>
                                    <span className="font-medium text-green-600">{emailMetrics.delivered}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Opened:</span>
                                    <span className="font-medium text-blue-600">{emailMetrics.opened}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Failed:</span>
                                    <span className="font-medium text-red-600">{emailMetrics.failed}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {(campaign.campaign_type === 'sms' || campaign.campaign_type === 'both') ? (
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Sent:</span>
                                    <span className="font-medium">{mmsMetrics.total}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Delivered:</span>
                                    <span className="font-medium text-green-600">{mmsMetrics.delivered}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Failed:</span>
                                    <span className="font-medium text-red-600">{mmsMetrics.failed}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-muted-foreground">
                                {new Date(campaign.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCampaignSelect(campaign.id)}
                                >
                                  <FaEye />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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