import React, { useState } from 'react';
import { FaAmazon, FaRobot, FaEnvelope, FaSms, FaTiktok, FaDatabase, FaCheckCircle, FaPlay, FaList } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ToolsTab() {
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLaunchCampaign = () => {
    setShowConfirmDialog(true);
  };

  const confirmLaunchCampaign = () => {
    setIsLoading(true);
    fetch('https://evenbetterbuy.app.n8n.cloud/webhook/cb079c41-7937-430a-a73a-8aa0cfd94946')
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
      })
      .catch(error => {
        console.error('Error launching campaign:', error);
        setIsLoading(false);
        toast.error('Failed to launch campaign. Please try again.');
      });
  };

  const cancelLaunchCampaign = () => {
    setShowConfirmDialog(false);
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
      <div className="flex flex-col gap-8  flex-1 pb-8">
        {/* Product Flow */}
        <div className="bg-muted/30 rounded-xl p-7 shadow-md flex flex-col gap-5 border border-border">
          <div className="font-bold text-xl mb-2 text-foreground">Leads Flow</div>
          <div className="flex flex-wrap gap-5 items-center justify-start">
            {/* Launch Campaign */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border">
              <FaPlay className="text-3xl mb-2 text-primary" />
              <span className="font-semibold mb-2 text-foreground">Launch Campaign</span>
              <button 
                onClick={handleLaunchCampaign}
                className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors"
              >
                Launch
              </button>
              <span className="text-xs text-muted-foreground">Start your campaign</span>
            </div>
            {/* Results of Campaigns */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border">
              <FaCheckCircle className="text-3xl mb-2 text-green-600 dark:text-green-400" />
              <span className="font-semibold mb-2 text-foreground">Results of Campaigns</span>
              <button 
                onClick={() => router.push('/results')}
                className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-sm hover:bg-primary/90 transition-colors"
              >
                View Results
              </button>
              <span className="text-xs text-muted-foreground">See analytics and outcomes</span>
            </div>
            {/* Show Logs */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border">
              <FaList className="text-3xl mb-2 text-primary" />
              <span className="font-semibold mb-2 text-foreground">Show Logs</span>
              <button 
                onClick={() => router.push('/logs')}
                className="border border-primary/30 text-primary px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-sm hover:border-primary/50 transition-colors"
              >
                View Logs
              </button>
              <span className="text-xs text-muted-foreground">Check campaign logs</span>
            </div>
          </div>
        </div>

        {/* Marketing Flow */}
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-7 shadow-md flex flex-col gap-5 border border-amber-200 dark:border-amber-800">
          <div className="font-bold text-xl mb-2 text-foreground">Marketing Flow</div>
          <div className="flex flex-wrap gap-5 items-center justify-start">
            {/* Generate SMS + Email */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border">
              <div className="flex gap-2 mb-2">
                <FaEnvelope className="text-2xl text-primary" />
                <FaSms className="text-2xl text-primary" />
              </div>
              <span className="font-semibold mb-2 text-foreground">Generate SMS + Email with AI</span>
              <button className="border border-primary/30 text-primary px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-sm">View</button>
              <span className="text-xs text-muted-foreground">Send via Twilio + Mail</span>
            </div>
          </div>
        </div>

        {/* TikTok Content Flow */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-7 shadow-md flex flex-col gap-5 border border-green-200 dark:border-green-800">
          <div className="font-bold text-xl mb-2 text-foreground">TikTok Content Flow</div>
          <div className="flex flex-wrap gap-5 items-center justify-start">
            {/* Write TikTok Scripts */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border">
              <FaTiktok className="text-3xl mb-2 text-primary" />
              <span className="font-semibold mb-2 text-foreground">Write TikTok Scripts</span>
              <button className="border border-primary/30 text-primary px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-sm">View</button>
              <span className="text-xs text-muted-foreground">Save Script to Supabase</span>
            </div>
            {/* Save Script to Supabase */}
            <div className="flex flex-col items-center bg-card rounded-lg p-5 shadow min-w-[220px] border border-border">
              <FaDatabase className="text-3xl mb-2 text-primary" />
              <span className="font-semibold mb-2 text-foreground">Save Script to Supabase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-border max-w-md mx-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <FaRobot className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground text-center">Confirm Campaign Launch</h2>
            <p className="text-muted-foreground mb-6 text-center">Are you sure you want to launch this campaign? This action cannot be undone.</p>
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