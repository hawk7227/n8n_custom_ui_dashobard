'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { createDynamicColumns, ContactData } from '@/components/dynamic-columns';
import { ContactDetailsDialog } from '@/components/contact-details-dialog';
import Navbar from '@/components/Navbar';

interface ApiResponse {
  // Core contact information
  Name: string;
  Email: string;
  Phone: string;
  "LinkedIn URL": string;
  Status: string;
  "Audience Type": string;
  "Last Contacted": string;
  Tags: string[];
  "Personal Email": string;
  "Scraped Bio": string;
  "AI Persona": string;
  "Recommended Ingredient": string;
  Gender: string;
  "Detected Emotion": string;
  "Pricing Tier Offered": number;
  "Loopbacks Triggered": number;
  "Detected Intention": string;
  "Email Body Content": string;
  "SMS Content": string;
  "Sent Image URL via Email": string;
  "Email Subject Content": string;
  "Fallback SMS Content": string;
  // Technical fields (will be filtered out)
  id?: string;
  Id?: string;
  createdTime?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  webhookUrl?: string;
  executionMode?: string;
}

export default function ResultsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<ContactData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Export functions
  const exportToCSV = () => {
    if (!tableData.length) return;
    
    const headers = columns.join(',');
    const rows = tableData.map(row => 
      columns.map(col => {
        const value = row[col] || '';
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contact-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Refresh data function
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    setTableData([]);
    setColumns([]);
    
    try {
      const response = await fetch('https://evenbetterbuy.app.n8n.cloud/webhook/1af20e39-0067-4f50-87f1-d7cf47e21746');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData: ApiResponse = await response.json();
      setData(apiData);
      
      // Handle multiple possible API response formats
      let records: any[] = [];
      
      // Check if the API response is an array of records
      if (Array.isArray(apiData)) {
        records = apiData;
      }
      // Check if the API response has a data array
      else if (apiData.body && Array.isArray(apiData.body)) {
        records = apiData.body;
      }
      // Check if the API response has a data property that's an array
      else if (apiData.body && apiData.body.data && Array.isArray(apiData.body.data)) {
        records = apiData.body.data;
      }
      // If it's a single object, treat it as one record
      else if (typeof apiData === 'object' && apiData !== null) {
        records = [apiData];
      }
      
      // Process each record
      const tableRows: ContactData[] = [];
      records.forEach((record) => {
        const dataRow: ContactData = {};
        
        // Process each field from the record
        Object.entries(record).forEach(([key, value]) => {
          // Skip useless fields
          const skipFields = [
            'webhookUrl', 'executionMode', 'headers', 'params', 'query', 'body',
            'id', 'Id', 'createdTime'
          ];
          
          if (skipFields.includes(key)) {
            return;
          }
          
          // Handle different data types
          if (Array.isArray(value)) {
            dataRow[key] = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            dataRow[key] = JSON.stringify(value);
          } else {
            dataRow[key] = String(value);
          }
        });
        
        tableRows.push(dataRow);
      });
      
      setTableData(tableRows);
      
      // Extract all unique column names
      const allColumns = new Set<string>();
      tableRows.forEach(row => {
        Object.keys(row).forEach(key => allColumns.add(key));
      });
      setColumns(Array.from(allColumns));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://evenbetterbuy.app.n8n.cloud/webhook/1af20e39-0067-4f50-87f1-d7cf47e21746');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData: ApiResponse = await response.json();
        setData(apiData);
        
        // Convert API response to table format
        const tableRows: ContactData[] = [];
        
        // Handle multiple possible API response formats
        let records: any[] = [];
        
        // Check if the API response is an array of records
        if (Array.isArray(apiData)) {
          records = apiData;
        }
        // Check if the API response has a data array
        else if (apiData.body && Array.isArray(apiData.body)) {
          records = apiData.body;
        }
        // Check if the API response has a data property that's an array
        else if (apiData.body && apiData.body.data && Array.isArray(apiData.body.data)) {
          records = apiData.body.data;
        }
        // If it's a single object, treat it as one record
        else if (typeof apiData === 'object' && apiData !== null) {
          records = [apiData];
        }
        
        // Process each record
        records.forEach((record) => {
          const dataRow: ContactData = {};
          
          // Process each field from the record
          Object.entries(record).forEach(([key, value]) => {
            // Skip useless fields
            const skipFields = [
              'webhookUrl', 'executionMode', 'headers', 'params', 'query', 'body',
              'id', 'Id', 'createdTime'
            ];
            
            if (skipFields.includes(key)) {
              return;
            }
            
            // Handle different data types
            if (Array.isArray(value)) {
              dataRow[key] = value.join(', ');
            } else if (typeof value === 'object' && value !== null) {
              dataRow[key] = JSON.stringify(value);
            } else {
              dataRow[key] = String(value);
            }
          });
          
          tableRows.push(dataRow);
        });
        
        setTableData(tableRows);
        
        // Extract all unique column names
        const allColumns = new Set<string>();
        tableRows.forEach(row => {
          Object.keys(row).forEach(key => allColumns.add(key));
        });
        setColumns(Array.from(allColumns));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/40 animate-ping"></div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Fetching API Data</h3>
          <p className="text-muted-foreground">Please wait while we retrieve the latest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 dark:bg-destructive/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-destructive text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Error Loading Data</h2>
          <p className="text-muted-foreground mb-6 bg-destructive/5 dark:bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            {error}
          </p>
          <button 
            onClick={refreshData}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <span>🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Navbar */}
      <Navbar 
        showSidebarToggle={false}
      />
      
      {/* Main Content */}
      <div className="flex-1 bg-background p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Contact Records</h1>
              <p className="text-muted-foreground">Displaying contact data from webhook response</p>
            </div>
            {data && (
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">{tableData.length} Records</span>
                </div>
                <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">{columns.length} Fields</span>
                </div>
                
                <button
                  onClick={exportToCSV}
                  disabled={!tableData.length}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !tableData.length
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <span>📊</span>
                  Export CSV
                </button>
                
                <button 
                  onClick={refreshData}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-border p-6">
          {tableData.length > 0 && (
            <DataTable
              columns={createDynamicColumns(tableData)}
              data={tableData}
              searchKey="Name"
              searchPlaceholder="Search contacts..."
              onRowClick={(contact) => {
                setSelectedContact(contact);
                setDialogOpen(true);
              }}
            />
          )}
        </div>

        {/* Contact Details Dialog */}
        {selectedContact && (
          <ContactDetailsDialog 
            contact={selectedContact}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </div>
    </div>
  </div>
  );
} 