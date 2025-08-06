"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaDownload, FaEye, FaClock, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaChevronDown, FaTimes, FaUsers, FaBox } from 'react-icons/fa';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  campaign: string;
  action: string;
  details?: string;
}

type FlowType = 'leads' | 'bundle';

export default function ShowLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowType>('leads');
  const exportRef = React.useRef<HTMLDivElement>(null);
  
  // Dialog state variables
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [dialogContent, setDialogContent] = useState<any>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Flow configuration
  const flowConfig = {
    leads: {
      workflowId: 'g6A1VMI4Mofkc3Mu',
      name: 'Leads Flow',
      icon: FaUsers,
      color: 'blue'
    },
    bundle: {
      workflowId: 'yJSsttzrtd4exJby',
      name: 'Bundle Flow',
      icon: FaBox,
      color: 'orange'
    }
  };

  // Handle click outside export menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${selectedFlow}_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowExportMenu(false);
  };

  // Export as CSV
  const handleExportCSV = () => {
    if (!filteredLogs.length) return;
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(filteredLogs[0]);
    const csv = [
      header.join(','),
      ...filteredLogs.map(row =>
        header.map(fieldName => JSON.stringify((row as any)[fieldName], replacer)).join(',')
      )
    ].join('\r\n');
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${selectedFlow}_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowExportMenu(false);
  };

  // Fetch data from n8n API
  const fetchLogs = useCallback(async (flowType: FlowType = selectedFlow) => {
    try {
      setIsLoading(true);
      const config = flowConfig[flowType];
      const response = await fetch(`https://evenbetterbuy.app.n8n.cloud/webhook/97b7faee-b0bc-40df-b3f0-0db7426a059a?workflowId=${config.workflowId}`, {
        headers: {
          'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZjgxY2M2NC05OTRmLTQ5NTUtYjY3Ny1hOGYwYWRhM2E3ODciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzNTEwMjAyfQ.V0iFO9AdtL1fqqzxloXmRfsAewHAdIi1hdJrrwTBBo4'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform n8n execution data to LogEntry format
      const transformedLogs: LogEntry[] = data[0]?.data?.map((execution: any, index: number) => {
        // Determine status based on finished flag and stoppedAt
        let status = 'unknown';
        let level: 'info' | 'warning' | 'error' | 'success' = 'info';
        
        if (execution.finished === false && execution.stoppedAt) {
          status = 'completed';
          level = 'success';
        } else if (execution.finished === false && !execution.stoppedAt) {
          status = 'running';
          level = 'warning';
        } else {
          status = 'stopped';
          level = 'error';
        }
        
        return {
          id: execution.id || `execution-${index}`,
          timestamp: execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Unknown',
          level: level,
          message: `${config.name} execution ${status}`,
          campaign: `${config.name} ${execution.mode || 'Execution'}`,
          action: `Mode: ${execution.mode || 'Unknown'}`,
          details: execution.stoppedAt ? `Stopped at ${new Date(execution.stoppedAt).toLocaleString()}` : 'In progress'
        };
      }) || [];

      setLogs(transformedLogs);
      setFilteredLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Fallback to mock data if API fails
      const fallbackLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toLocaleString(),
          level: 'error',
          message: `Failed to fetch ${flowConfig[flowType].name} logs from API`,
          campaign: 'System Error',
          action: 'API Connection',
          details: 'Please check your connection and try again'
        }
      ];
      setLogs(fallbackLogs);
      setFilteredLogs(fallbackLogs);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlow, flowConfig]);

  useEffect(() => {
    fetchLogs();
  }, [selectedFlow, fetchLogs]);

  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filter by campaign
    if (selectedCampaign !== 'all') {
      filtered = filtered.filter(log => log.campaign === selectedCampaign);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel, selectedCampaign]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const uniqueCampaigns = [...new Set(logs.map(log => log.campaign))];

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading logs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between bg-card text-card-foreground rounded-t-xl px-8 py-4 mb-6 shadow-lg border border-border">
        <div className="flex items-center gap-3">
          <FaClock className="text-2xl text-primary" />
          <span className="font-bold text-xl tracking-tight">Campaign Logs</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchLogs()}
            className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full ${isLoading ? 'animate-spin' : ''}`}></div>
            Refresh
          </button>
          <div className="relative" ref={exportRef}>
            <button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow transition-colors flex items-center gap-2"
              onClick={() => setShowExportMenu((prev) => !prev)}
              type="button"
            >
              <FaDownload className="text-sm" />
              Export Logs
              <FaChevronDown className="text-xs" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10 animate-fade-in">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-muted/40 text-foreground text-sm rounded-t-lg"
                  onClick={handleExportJSON}
                >
                  Export as JSON
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-muted/40 text-foreground text-sm rounded-b-lg"
                  onClick={handleExportCSV}
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flow Selector */}
      <div className="bg-card rounded-xl shadow-md border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Select Flow:</span>
          <div className="flex gap-2">
            {Object.entries(flowConfig).map(([key, config]) => {
              const IconComponent = config.icon;
              const isSelected = selectedFlow === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFlow(key as FlowType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? `bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400 border-${config.color}-200 dark:border-${config.color}-800`
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                  }`}
                >
                  <IconComponent className="text-sm" />
                  {config.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-md border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Levels</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="info">Info</option>
            </select>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Campaigns</option>
              {uniqueCampaigns.map((campaign) => (
                <option key={campaign} value={campaign}>{campaign}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Level
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Campaign
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Message
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeClass(log.level)}`}>
                        {log.level}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {log.campaign}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {log.action}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {log.message}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {log.details && (
                      <button 
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                        onClick={async () => {
                          try {
                            setIsDialogLoading(true);
                            setShowDetailsDialog(true);
                            setDialogError(null);
                            setDialogContent(null);
                            
                            const config = flowConfig[selectedFlow];
                            const response = await fetch(`https://evenbetterbuy.app.n8n.cloud/webhook/c275f012-39f5-40b5-85f4-67e48ff532e435?id=${log.id}&workflowId=${config.workflowId}`, {
                              method: 'GET',
                              headers: {
                                'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZjgxY2M2NC05OTRmLTQ5NTUtYjY3Ny1hOGYwYWRhM2E3ODciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzNTEwMjAyfQ.V0iFO9AdtL1fqqzxloXmRfsAewHAdIi1hdJrrwTBBo4'
                              }
                            });
                            
                            if (!response.ok) {
                              throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            console.log("log.id", log.id);
                            console.log(data);
                            setDialogContent(Array.isArray(data) ? data[0] : data); // Fix: use first object if array
                          } catch (error) {
                            console.error('Error viewing execution:', error);
                            setDialogError('Failed to fetch execution details. Please try again.');
                          } finally {
                            setIsDialogLoading(false);
                          }
                        }}
                      >
                        <FaEye className="text-xs" />
                        View
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FaInfoCircle className="text-4xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No logs found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-muted/30 rounded-xl p-4 border border-border">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Current Flow:</span>
            <span className="font-medium">{flowConfig[selectedFlow].name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Logs:</span>
            <span className="font-medium">{filteredLogs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Showing:</span>
            <span className="font-medium">{filteredLogs.length} of {logs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="font-medium">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Execution Details Dialog */}
      {showDetailsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <FaEye className="text-xl text-primary" />
                <h2 className="text-xl font-bold text-foreground">Execution Details</h2>
              </div>
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {(() => { console.log('Execution Details dialogContent:', dialogContent); return null; })()}
              {isDialogLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-muted-foreground">Loading execution details...</span>
                  </div>
                </div>
              ) : dialogError ? (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Details</h3>
                  <p className="text-muted-foreground">{dialogError}</p>
                  <button
                    onClick={() => setShowDetailsDialog(false)}
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : dialogContent ? (
                <div className="space-y-6">
                  {/* Workflow Overview */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="text-xl font-bold text-foreground">Workflow Execution Overview</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Execution ID</h4>
                        <p className="text-sm font-mono text-foreground">{dialogContent?.id || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dialogContent.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          dialogContent.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          dialogContent.status === 'running' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          dialogContent.status === 'verifying' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {dialogContent.status === 'verifying' ? (
                            <>
                              <span className="mr-1 inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                              Verifying
                            </>
                          ) : (dialogContent?.status || 'N/A')}
                        </span>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Mode</h4>
                        <p className="text-sm text-foreground capitalize">{dialogContent?.mode || 'Unknown'}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Started At</h4>
                        <p className="text-sm text-foreground">{dialogContent?.startedAt ? new Date(dialogContent.startedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Finished At</h4>
                        <p className="text-sm text-foreground">{dialogContent?.stoppedAt ? new Date(dialogContent.stoppedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                        <p className="text-sm text-foreground">
                          {dialogContent?.startedAt && dialogContent?.stoppedAt ? 
                            `${Math.round((new Date(dialogContent.stoppedAt).getTime() - new Date(dialogContent.startedAt).getTime()) / 1000)}s` : 
                            'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Details */}
                  {dialogContent.workflowData && (
                    <div className="bg-muted/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Workflow Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <h4 className="font-medium text-foreground mb-2">Workflow Info</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <span className="text-foreground font-medium">{dialogContent.workflowData.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ID:</span>
                              <span className="text-foreground font-mono">{dialogContent.workflowData.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Active:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                dialogContent.workflowData.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                {dialogContent.workflowData.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <h4 className="font-medium text-foreground mb-2">Execution Settings</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Execution Order:</span>
                              <span className="text-foreground font-medium">{dialogContent.workflowData.settings?.executionOrder || 'Default'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Finished:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                dialogContent.finished ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {dialogContent.finished ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Node Execution Details */}
                  {dialogContent.data?.resultData?.runData && (
                    <div className="bg-muted/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Node Execution Details
                      </h3>
                      
                      <div className="space-y-4">
                        {Object.entries(dialogContent.data.resultData.runData).map(([nodeName, executions]: [string, any]) => (
                          <div key={nodeName} className="bg-background rounded-lg p-4 border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-foreground">{nodeName}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                executions[0]?.executionStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                executions[0]?.executionStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {executions[0]?.executionStatus || 'unknown'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Start Time:</span>
                                <p className="text-foreground">{executions[0]?.startTime ? new Date(executions[0].startTime).toLocaleString() : 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Execution Time:</span>
                                <p className="text-foreground">{executions[0]?.executionTime ? `${executions[0].executionTime}ms` : 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Execution Index:</span>
                                <p className="text-foreground">{executions[0]?.executionIndex || 'N/A'}</p>
                              </div>
                            </div>
                            
                            {/* Node Data */}
                            {executions[0]?.data && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-foreground mb-2">Output Data:</h5>
                                <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                  <pre className="text-xs text-foreground whitespace-pre-wrap">
                                    {JSON.stringify(executions[0].data, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                            
                            {/* Source Nodes */}
                            {executions[0]?.source && executions[0].source.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-foreground mb-2">Source Nodes:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {executions[0].source.map((source: any, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs">
                                      {source.previousNode}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Information */}
                  {dialogContent.data?.resultData?.runData && 
                   Object.values(dialogContent.data.resultData.runData).some((executions: any) => 
                     executions.some((execution: any) => execution.executionStatus === 'error')
                   ) && (
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
                        <FaExclamationTriangle className="text-xl" />
                        Error Information
                      </h3>
                      
                      <div className="space-y-3">
                        {Object.entries(dialogContent.data.resultData.runData).map(([nodeName, executions]: [string, any]) => 
                          executions.map((execution: any, index: number) => 
                            execution.executionStatus === 'error' && (
                              <div key={`${nodeName}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-red-800 dark:text-red-400">{nodeName}</h4>
                                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                                    Error
                                  </span>
                                </div>
                                {execution.error && (
                                  <div className="text-sm text-red-700 dark:text-red-300">
                                    <p className="font-medium mb-1">Error Message:</p>
                                    <p className="bg-red-50 dark:bg-red-900/20 rounded p-2">{execution.error.message || 'Unknown error'}</p>
                                  </div>
                                )}
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground hover:text-foreground/80">
                        <FaChevronDown className="text-xs transition-transform group-open:rotate-180" />
                        View Raw JSON Data
                      </summary>
                      <div className="mt-4 bg-background border border-border rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-foreground whitespace-pre-wrap">
                          {JSON.stringify(dialogContent, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 