import React, { useState } from 'react';
import { 
  FaAmazon, FaRobot, FaEnvelope, FaSms, FaTiktok, FaDatabase, FaCheckCircle, 
  FaPlay, FaList, FaUsers, FaChartLine, FaFileAlt, FaCog, FaArrowRight,
  FaRocket, FaBullhorn, FaVideo, FaCloudUploadAlt, FaEye, FaClock, FaBox
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ToolsTab() {
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [weblink, setWeblink] = useState('');
  const [perPage, setPerPage] = useState(20);
  const router = useRouter();

  const handleLaunchCampaign = () => {
    setShowConfirmDialog(true);
  };

  const confirmLaunchCampaign = () => {
    if (!campaignName.trim() || !weblink.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const campaignId = generateUUID();
    
    fetch('https://evenbetterbuy.app.n8n.cloud/webhook/c3ce318e-0d2f-4051-88fa-3a4291e4a973', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_name: campaignName,
        campaign_id: campaignId,
        weblink: weblink,
        per_page: perPage
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setIsLoading(false);
        setShowConfirmDialog(false);
        setShowPopup(true);
        // Reset form fields
        setCampaignName('');
        setWeblink('');
        setPerPage(20);
      })
      .catch(error => {
        console.error('Error launching campaign:', error);
        setIsLoading(false);
        toast.error('Failed to launch campaign. Please try again.');
      });
  };

  const cancelLaunchCampaign = () => {
    setShowConfirmDialog(false);
    // Reset form fields
    setCampaignName('');
    setWeblink('');
    setPerPage(20);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in relative flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-card text-card-foreground rounded-t-xl px-8 py-4 mb-8 shadow-lg border border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
          <span className="font-bold text-xl tracking-tight">My AI Flows</span>
        </div>
      </div>

      {/* Flows */}
      <div className="flex flex-col gap-8 flex-1 pb-8">
        {/* Leads Flow */}
        <div className="bg-muted/30 rounded-xl p-7 shadow-md flex flex-col gap-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FaUsers className="text-xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-xl text-foreground">Leads Flow</div>
              <div className="text-sm text-muted-foreground">Find and engage potential customers</div>
            </div>
          </div>
          
          {/* Flow Diagram */}
          <div className="flex items-center justify-center mb-6 p-4 bg-card/50 rounded-lg border border-border">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaRocket className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs text-center">Launch</span>
              </div>
              <FaArrowRight className="text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaChartLine className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center">Results</span>
              </div>
              <FaArrowRight className="text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaFileAlt className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs text-center">Logs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 items-center justify-start">
            {/* Launch Campaign */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                <FaRocket className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Launch Campaign</span>
              <button 
                onClick={handleLaunchCampaign}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaPlay className="text-xs" />
                Launch
              </button>
              <span className="text-xs text-muted-foreground text-center">Start your campaign</span>
            </div>

            {/* Results of Campaigns */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                <FaChartLine className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Results of Campaigns</span>
              <button 
                onClick={() => router.push('/results')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaEye className="text-xs" />
                View Results
              </button>
              <span className="text-xs text-muted-foreground text-center">See analytics and outcomes</span>
            </div>

            {/* Show Logs */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                <FaFileAlt className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Show Logs</span>
              <button 
                onClick={() => router.push('/logs')}
                className="border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <FaList className="text-xs" />
                View Logs
              </button>
              <span className="text-xs text-muted-foreground text-center">Check campaign logs</span>
            </div>
          </div>
        </div>



        {/* Email/MMS Campaign Flow */}
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-7 shadow-md flex flex-col gap-5 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <FaEnvelope className="text-xl text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-xl text-foreground">Email/MMS Campaign Flow</div>
              <div className="text-sm text-muted-foreground">Send email and MMS campaigns to your audience</div>
            </div>
          </div>
          
          {/* Flow Diagram */}
          <div className="flex items-center justify-center mb-6 p-4 bg-card/50 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaRocket className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs text-center">Launch</span>
              </div>
              <FaArrowRight className="text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaChartLine className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center">Results</span>
              </div>
              <FaArrowRight className="text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaFileAlt className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs text-center">Logs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 items-center justify-start">
            {/* Create Email/MMS Campaign */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
                <FaEnvelope className="text-2xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Create Email/MMS Campaign</span>
              <button 
                onClick={() => router.push('/email-mms-campaign')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaCog className="text-xs" />
                Create
              </button>
              <span className="text-xs text-muted-foreground text-center">Create your email/MMS campaign</span>
            </div>

            {/* Launch Campaign */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                <FaRocket className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Launch Campaign</span>
              <button 
                onClick={() => router.push('/launch-campaign')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaPlay className="text-xs" />
                Launch
              </button>
              <span className="text-xs text-muted-foreground text-center">Launch your campaign</span>
            </div>

            {/* Results of Email/MMS Campaigns */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                <FaChartLine className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Results of Email/MMS Campaigns</span>
              <button 
                onClick={() => router.push('/email-mms-results')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaEye className="text-xs" />
                View Results
              </button>
              <span className="text-xs text-muted-foreground text-center">See analytics and outcomes</span>
            </div>

            {/* Show Email/MMS Logs */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                <FaFileAlt className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Show Email/MMS Logs</span>
              <button 
                onClick={() => router.push('/logs')}
                className="border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <FaList className="text-xs" />
                View Logs
              </button>
              <span className="text-xs text-muted-foreground text-center">Check email/MMS campaign logs</span>
            </div>
          </div>
        </div>

        {/* TikTok Content Flow */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-7 shadow-md flex flex-col gap-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FaVideo className="text-xl text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-bold text-xl text-foreground">TikTok Content Flow</div>
              <div className="text-sm text-muted-foreground">Create and manage TikTok content</div>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="flex items-center justify-center mb-6 p-4 bg-card/50 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaTiktok className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs text-center">Script</span>
              </div>
              <FaArrowRight className="text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaDatabase className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center">Save</span>
              </div>
              <FaArrowRight className="text-muted-foreground" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                  <FaCloudUploadAlt className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs text-center">Upload</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 items-center justify-start">
            {/* Write TikTok Scripts */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                <FaTiktok className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Write TikTok Scripts</span>
              <button className="border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-bold mb-2 shadow-sm hover:border-primary/50 transition-colors flex items-center gap-2">
                <FaEye className="text-xs" />
                View
              </button>
              <span className="text-xs text-muted-foreground text-center">AI-powered script generation</span>
            </div>

            {/* Save Script to Supabase */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                <FaDatabase className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold mb-2 text-foreground text-center">Save Script to Supabase</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <FaClock className="text-xs" />
                <span>Auto-save enabled</span>
              </div>
              <span className="text-xs text-muted-foreground text-center">Secure cloud storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-border max-w-md mx-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <FaRocket className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground text-center">Campaign Details</h2>
            <p className="text-muted-foreground mb-6 text-center">Please provide the campaign details to launch</p>
            
            <div className="w-full space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">campaign name *</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Apollo Link *</label>
                <input
                  type="url"
                  value={weblink}
                  onChange={(e) => setWeblink(e.target.value)}
                  placeholder="https://app.apollo.io/#/people?sortAscending=false&sortByField=recommendations_score&personLocations[]=United%20States&page=1&contactEmailStatusV2[]=verified"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Per Page</label>
                <input
                  type="number"
                  value={perPage}
                  onChange={(e) => setPerPage(parseInt(e.target.value) || 20)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="flex gap-3 w-full">
              <button
                className={`flex-1 font-semibold py-2 px-4 rounded-lg border border-border transition-colors ${
                  isLoading 
                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
                onClick={cancelLaunchCampaign}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className={`flex-1 font-semibold py-2 px-4 rounded-lg shadow transition-colors ${
                  isLoading 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
                onClick={confirmLaunchCampaign}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Launching...
                  </div>
                ) : (
                  'Launch Campaign'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-10 shadow-2xl flex flex-col items-center border border-border">
            <FaCheckCircle className="text-4xl text-green-600 dark:text-green-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Campaign Launched!</h2>
            <p className="text-muted-foreground mb-6 text-center">Your campaign is now running.<br />You will see results in a few minutes.</p>
            <button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg shadow"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}


    </div>
  );
}