'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaEnvelope, FaEye, FaPaperPlane, FaImage, FaChevronDown, FaSpinner, FaMagic, FaGlobe } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase, Brand, LandingPage } from '@/lib/supabase';
import ImageSelector from '@/components/ImageSelector';

interface LeadData {
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
  "Email Subject Content": string;
  "Fallback SMS Content": string;
  "Sent Image URL via Email": string;
  "campaign name"?: string;
  "campaign id"?: string;
}

interface CampaignForm {
  subject: string;
  emailBody: string;
  smsContent: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  campaignType: 'email' | 'sms' | 'both';
  imageUrl: string;
  emailImageUrl: string; // New field for email body image
  emailLandingPageUrl: string; // New field for email body landing page URL
  sendEmailAsImage: boolean;
}

interface GenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (contentType: string, userInput: string, includeImage: boolean, includePurchaseLink: boolean, selectedLandingPage: LandingPage | null) => void;
  selectedBrand: Brand | null;
  selectedLandingPage: LandingPage | null;
  setSelectedLandingPage: (landingPage: LandingPage | null) => void;
  landingPages: LandingPage[];
  isLoading: boolean;
  contentType: string;
}

interface TestEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

interface TestMMSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
  isLoading: boolean;
}

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  response: any;
}

interface CampaignSavedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignId: string;
  isEditing: boolean;
  onContinueEditing: () => void;
}

interface CampaignNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignName: string, campaignType: 'email' | 'sms' | 'both') => void;
  isLoading: boolean;
  defaultName?: string;
  currentCampaignType: 'email' | 'sms' | 'both';
  isEditing?: boolean;
}

const GenerateDialog: React.FC<GenerateDialogProps> = ({
  isOpen,
  onClose,
  onGenerate,
  selectedBrand,
  selectedLandingPage,
  setSelectedLandingPage,
  landingPages,
  isLoading,
  contentType
}) => {
  const [userInput, setUserInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [includeImage, setIncludeImage] = useState(contentType === 'email_body');
  const [includeLandingPage, setIncludeLandingPage] = useState(false);
  const [selectedLandingPageForGeneration, setSelectedLandingPageForGeneration] = useState<LandingPage | null>(null);

  // Predefined prompts for each content type
  const predefinedPrompts = {
    email_subject: [
      "🚀 New Product Launch - Create an exciting, curiosity-driven subject line that highlights the unique benefits and creates urgency. Focus on the problem it solves and the transformation it offers. Keep it under 50 characters for optimal open rates.",
      "💰 Limited Time Sale - Generate a compelling subject line that creates FOMO (fear of missing out) and urgency. Include specific savings, time constraints, and exclusive benefits. Use power words that drive action.",
      "📧 Newsletter - Write an engaging subject line that promises valuable insights, industry trends, or exclusive content. Make it personal and relevant to the audience's interests and pain points.",
      "🎁 Customer Appreciation - Create a warm, personal subject line that makes customers feel valued and special. Include exclusive benefits, early access, or personalized offers that show genuine appreciation.",
      "📢 Product Update - Generate an informative yet exciting subject line about new features, improvements, or enhancements. Focus on the benefits and improvements that matter most to users."
    ],
    email_body: [
      "🚀 New Product Launch - Write a compelling email that introduces our new product with a strong hook, clear value proposition, and compelling benefits. Include social proof, urgency elements, and a clear call-to-action. Make it conversational and engaging with storytelling elements.",
      "💰 Flash Sale - Create an urgent, action-driven email that emphasizes limited-time offers, exclusive savings, and scarcity. Include countdown elements, specific benefits, and multiple CTAs. Use power words and create excitement around the deal.",
      "📧 Newsletter - Generate an informative, value-driven email that shares industry insights, company updates, and helpful tips. Include engaging headlines, personal stories, and actionable takeaways. Make it educational and entertaining.",
      "🎁 Customer Appreciation - Write a warm, personal email that genuinely thanks customers for their loyalty. Include exclusive offers, early access to new products, or special discounts. Make it feel personal and heartfelt.",
      "📢 Product Update - Create an informative email that announces new features, improvements, or enhancements. Focus on how these changes benefit the user, include before/after comparisons, and encourage engagement with the new features."
    ],
    mms_text: [
      "🚀 New Product - Create a short, impactful MMS that introduces our new product with key benefits and a strong call-to-action. Include emojis for visual appeal and keep it under 160 characters. Focus on the main value proposition and urgency.",
      "💰 Flash Sale - Generate an urgent MMS that creates FOMO with limited-time offers and exclusive savings. Include specific discounts, time constraints, and action words. Use emojis strategically and make it impossible to ignore.",
      "📢 Product Update - Write a concise MMS that announces new features or improvements with excitement. Focus on the benefits to the user and include a clear next step. Keep it informative yet engaging with relevant emojis.",
      "🎁 Customer Appreciation - Create a warm, personal MMS that thanks customers and offers exclusive benefits. Make it feel special and include a unique offer or early access. Use friendly, appreciative language with heart emojis.",
      "🎯 Seasonal Promotion - Generate a timely MMS that ties into current seasons, holidays, or events. Include relevant themes, special offers, and seasonal urgency. Make it feel current and relevant to what's happening now."
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && selectedBrand) {
      onGenerate(contentType, userInput, includeImage, false, includeLandingPage ? selectedLandingPageForGeneration : null);
    }
  };

  const handleClose = () => {
    setUserInput('');
    setShowPrompts(true);
    setIncludeImage(contentType === 'email_body');
    onClose();
  };

  // Short titles for display
  const promptTitles = {
    email_subject: [
      "🚀 New Product Launch",
      "💰 Limited Time Sale", 
      "📧 Newsletter",
      "🎁 Customer Appreciation",
      "📢 Product Update"
    ],
    email_body: [
      "🚀 New Product Launch",
      "💰 Flash Sale",
      "📧 Newsletter", 
      "🎁 Customer Appreciation",
      "📢 Product Update"
    ],
    mms_text: [
      "🚀 New Product",
      "💰 Flash Sale",
      "📢 Product Update",
      "🎁 Customer Appreciation", 
      "🎯 Seasonal Promotion"
    ]
  };

  const handlePromptSelect = (prompt: string) => {
    setUserInput(prompt);
  };

  // Update checkbox states when content type changes
  useEffect(() => {
    const shouldIncludeAssets = contentType === 'email_body';
    setIncludeImage(shouldIncludeAssets);
  }, [contentType]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FaMagic className="text-indigo-600" />
            Generate {contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {selectedBrand && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                for {selectedBrand.brand_name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 px-1">
            {/* Brand Selection Warning */}
            {!selectedBrand && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Please select a brand first to generate content
                </p>
              </div>
            )}



            {/* Collapsible Predefined Prompts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">💡 Quick Templates</Label>
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPrompts ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showPrompts && (
                <div className="grid grid-cols-2 gap-2">
                  {predefinedPrompts[contentType as keyof typeof predefinedPrompts]?.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePromptSelect(prompt)}
                      className="text-left p-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-md transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                      disabled={!selectedBrand}
                      title={prompt}
                    >
                      {promptTitles[contentType as keyof typeof promptTitles]?.[index]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Input */}
            <div className="space-y-2">
              <Label htmlFor="userInput">✍️ Custom Instructions</Label>
              <Textarea
                id="userInput"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe what you want to generate... (e.g., 'A fun email about energy gummies', 'Professional SMS about service upgrade')"
                rows={4}
                disabled={!selectedBrand}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                💡 Be specific about tone, style, and key messaging points.
              </p>
            </div>

            {/* Brand Assets Options */}
            {selectedBrand && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">🎨 Include Brand Assets</Label>
                
                {/* Image Selection */}
                {selectedBrand.product_images && selectedBrand.product_images.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeImage"
                        checked={includeImage}
                        onChange={(e) => setIncludeImage(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="includeImage" className="text-sm">
                        📸 Include product images
                      </Label>
                    </div>
                    {includeImage && (
                      <div className="ml-6 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          Available images: {selectedBrand.product_images.length}
                        </p>
                        <div className="flex gap-2 overflow-x-auto">
                          {selectedBrand.product_images.map((image, index) => (
                            <div key={index} className="flex-shrink-0">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border border-border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}



                {/* Landing Page Selection */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeLandingPage"
                      checked={includeLandingPage}
                      onChange={(e) => setIncludeLandingPage(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="includeLandingPage" className="text-sm">
                      🌐 Include landing page
                    </Label>
                  </div>
                  {includeLandingPage && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-xs text-muted-foreground">Select landing page:</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                          >
                            {selectedLandingPageForGeneration ? (
                              selectedLandingPageForGeneration.name || `Landing Page #${String(selectedLandingPageForGeneration.id).slice(-8)}`
                            ) : (
                              'Select a landing page'
                            )}
                            <FaChevronDown className="text-xs" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 max-h-[200px] overflow-y-auto">
                          {landingPages.map((landingPage) => (
                            <DropdownMenuItem
                              key={landingPage.id}
                              onClick={() => {
                                setSelectedLandingPageForGeneration(landingPage);
                                setSelectedLandingPage(landingPage);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col items-start">
                                <span className="text-sm">{landingPage.name || `Landing Page #${String(landingPage.id).slice(-8)}`}</span>
                                {landingPage.brand && (
                                  <span className="text-xs text-muted-foreground">Brand: {landingPage.brand}</span>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                          {landingPages.length === 0 && (
                            <DropdownMenuItem disabled>
                              No landing pages found
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {selectedLandingPageForGeneration && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Selected: {selectedLandingPageForGeneration.name || `Landing Page #${String(selectedLandingPageForGeneration.id).slice(-8)}`}
                          </p>
                          {selectedLandingPageForGeneration.brand && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Brand: {selectedLandingPageForGeneration.brand}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* No Assets Warning */}
                {(!selectedBrand.product_images || selectedBrand.product_images.length === 0) && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ℹ️ No brand assets available. You can still generate content without images.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedBrand || !userInput.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaMagic className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TestEmailDialog: React.FC<TestEmailDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit(email);
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaEnvelope className="text-indigo-600" />
            Send Test Email
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address to receive the test email"
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your email address to receive a test version of this campaign
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TestMMSDialog: React.FC<TestMMSDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic phone validation (accepts various formats)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number (e.g., +15551234567 or 555-123-4567)');
      return;
    }

    onSubmit(phone);
  };

  const handleClose = () => {
    setPhone('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaImage className="text-indigo-600" />
            Send Test MMS
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testPhone">Phone Number</Label>
            <Input
              id="testPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number (e.g., +15551234567)"
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your phone number to receive a test MMS message
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!phone.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <FaImage className="mr-2" />
                  Send Test MMS
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  email,
  response
}) => {
  // Determine if this is an MMS or email based on the response structure
  const isMMS = response && (response.sid || response.account_sid);
  const isEmail = !isMMS;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              {isMMS ? (
                <FaImage className="text-green-600 dark:text-green-400" />
              ) : (
                <FaPaperPlane className="text-green-600 dark:text-green-400" />
              )}
            </div>
            Test {isMMS ? 'MMS' : 'Email'} Sent Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Test {isMMS ? 'MMS' : 'email'} has been sent successfully to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">API Response Details</Label>
            <div className="p-3 bg-muted/30 rounded-lg border">
              <pre className="text-xs text-muted-foreground overflow-y-auto max-h-48 whitespace-pre-wrap break-all">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              {isMMS 
                ? 'Check your phone for the test MMS message. Response details are logged to the console for debugging.'
                : 'Check your email inbox for the test message. Response details are logged to the console for debugging.'
              }
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CampaignSavedDialog: React.FC<CampaignSavedDialogProps> = ({
  isOpen,
  onClose,
  campaignName,
  campaignId,
  isEditing,
  onContinueEditing
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FaPaperPlane className="text-green-600 dark:text-green-400" />
            </div>
            Campaign Saved Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Campaign <strong>&ldquo;{campaignName}&rdquo;</strong> has been {isEditing ? 'updated' : 'saved'} successfully!
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Campaign Details</Label>
            <div className="p-3 bg-muted/30 rounded-lg border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign ID:</span>
                  <span className="font-mono text-xs">{campaignId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your campaign is now {isEditing ? 'updated and' : 'saved as a draft. You can'} edit it later or launch it when ready.
              {!isEditing && ' Click "Edit Campaign" to continue working on it.'}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onContinueEditing}>
              {isEditing ? 'Continue Editing' : 'Edit Campaign'}
            </Button>
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CampaignNameDialog: React.FC<CampaignNameDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultName,
  currentCampaignType,
  isEditing = false
}) => {
  const [campaignName, setCampaignName] = useState(defaultName || '');
  const [campaignType, setCampaignType] = useState<'email' | 'sms' | 'both'>(currentCampaignType);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!campaignName.trim()) {
      setError('Please enter a campaign name');
      return;
    }

    if (campaignName.trim().length < 3) {
      setError('Campaign name must be at least 3 characters long');
      return;
    }

    onSubmit(campaignName.trim(), campaignType);
  };

  const handleClose = () => {
    setCampaignName(defaultName || '');
    setCampaignType(currentCampaignType);
    setError('');
    onClose();
  };

  // Update campaign name when defaultName changes
  useEffect(() => {
    setCampaignName(defaultName || '');
    setCampaignType(currentCampaignType);
  }, [defaultName, currentCampaignType]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaPaperPlane className="text-indigo-600" />
            {isEditing ? 'Update Campaign' : 'Save Campaign'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter a name for your campaign..."
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Give your campaign a descriptive name to help you identify it later
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Campaign Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCampaignType('email')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  campaignType === 'email'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-border hover:border-indigo-300 bg-background'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2">
                  <FaEnvelope className="text-lg" />
                  <span className="text-sm font-medium">Email</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCampaignType('sms')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  campaignType === 'sms'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-border hover:border-indigo-300 bg-background'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2">
                  <FaImage className="text-lg" />
                  <span className="text-sm font-medium">MMS</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCampaignType('both')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  campaignType === 'both'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-border hover:border-indigo-300 bg-background'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <FaEnvelope className="text-sm" />
                    <FaImage className="text-sm" />
                  </div>
                  <span className="text-sm font-medium">Both</span>
                </div>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select the type of campaign you want to create
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!campaignName.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  {isEditing ? 'Update Campaign' : 'Save Campaign'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function EmailMMSCampaignPage() {
  const router = useRouter();
  const [allLeads, setAllLeads] = useState<LeadData[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadData[]>([]);
  const [selectedLeadIndex, setSelectedLeadIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [fetchingBrands, setFetchingBrands] = useState(false);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);
  const [fetchingLandingPages, setFetchingLandingPages] = useState(false);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  
  // Campaign editing state
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  const [campaignNotFound, setCampaignNotFound] = useState(false);
  const [formData, setFormData] = useState<CampaignForm>({
    subject: '',
    emailBody: '',
    smsContent: '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    campaignType: 'both',
    imageUrl: '',
    emailImageUrl: '', // New field for email body image
    emailLandingPageUrl: '', // New field for email body landing page URL
    sendEmailAsImage: true, // Default to true for email body
  });
  
  // Generate dialog state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContentType, setCurrentContentType] = useState('email_body');
  
  // Test email dialog state
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  
  // Test MMS dialog state
  const [isTestMMSDialogOpen, setIsTestMMSDialogOpen] = useState(false);
  const [isSendingTestMMS, setIsSendingTestMMS] = useState(false);
  
  // Success dialog state
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Image selector dialog state
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isEmailImageSelectorOpen, setIsEmailImageSelectorOpen] = useState(false);

  // Save campaign state
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [isCampaignSavedDialogOpen, setIsCampaignSavedDialogOpen] = useState(false);
  const [savedCampaignName, setSavedCampaignName] = useState('');
  const [savedCampaignId, setSavedCampaignId] = useState('');
  
  // Campaign name dialog state
  const [isCampaignNameDialogOpen, setIsCampaignNameDialogOpen] = useState(false);
  const [currentCampaignName, setCurrentCampaignName] = useState('');
  const [isCampaignSaved, setIsCampaignSaved] = useState(false);

  const selectedLead = filteredLeads[selectedLeadIndex];

  const handleBack = () => {
    router.push('/tools');
  };

  // Fetch brands from Supabase
  const fetchBrands = async () => {
    try {
      setFetchingBrands(true);
      const { data, error } = await supabase
        .from('brands')
        .select('id, brand_name, brand_content, brand_uuid, product_link, product_images')
        .order('brand_name', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
        return;
      }

      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setFetchingBrands(false);
    }
  };

  // Fetch landing pages from Supabase
  const fetchLandingPages = async () => {
    try {
      setFetchingLandingPages(true);
      const { data, error } = await supabase
        .from('landingpages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching landing pages:', error);
        return;
      }

      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
    } finally {
      setFetchingLandingPages(false);
    }
  };

  // Load brands and landing pages on component mount
  useEffect(() => {
    fetchBrands();
    fetchLandingPages();
  }, []);

  // Check for campaign ID in URL and load campaign data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    
    if (campaignId) {
      loadCampaignData(campaignId);
    }
  }, []);

  // Load campaign data if ID is provided in URL
  const loadCampaignData = async (campaignId: string) => {
    try {
      setIsLoadingCampaign(true);
      setCampaignNotFound(false);

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        console.error('Error loading campaign:', error);
        setCampaignNotFound(true);
        return;
      }

      if (!data) {
        setCampaignNotFound(true);
        return;
      }

      // Load the associated brand
      if (data.brand_id) {
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('id', data.brand_id)
          .single();

        if (!brandError && brandData) {
          setSelectedBrand(brandData);
        }
      }

      // Load the associated landing page
      if (data.landing_page_id) {
        const { data: landingPageData, error: landingPageError } = await supabase
          .from('landingpages')
          .select('*')
          .eq('id', data.landing_page_id)
          .single();

        if (!landingPageError && landingPageData) {
          setSelectedLandingPage(landingPageData);
        }
      }



      // Update form data with campaign data
      setFormData({
        subject: data.email_subject || '',
        emailBody: data.email_body || '',
        smsContent: data.mms_text_content || '',
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        campaignType: data.campaign_type || 'both',
        imageUrl: data.mms_image_url || '',
        emailImageUrl: data.email_image_url || '',
        emailLandingPageUrl: data.email_landing_page_url || '',
        sendEmailAsImage: data.send_email_as_image || false,
      });

      // Update campaign state
      setCurrentCampaignName(data.campaign_name);
      setIsCampaignSaved(true);
      setSavedCampaignId(data.id);
      setEditingCampaignId(data.id);

      console.log('Campaign loaded successfully:', data);

    } catch (error) {
      console.error('Error loading campaign:', error);
      setCampaignNotFound(true);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  // Extract unique campaigns from leads
  const extractCampaigns = (leads: LeadData[]) => {
    const campaignMap = new Map<string, string>();
    
    leads.forEach(lead => {
      if (lead['campaign id'] && lead['campaign name']) {
        campaignMap.set(lead['campaign id'], lead['campaign name']);
      }
    });
    
    const uniqueCampaigns = Array.from(campaignMap.entries()).map(([id, name]) => ({
      id,
      name
    }));
    
    return uniqueCampaigns.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter leads by campaign
  const filterLeadsByCampaign = (leads: LeadData[], campaignId: string) => {
    if (campaignId === 'all') {
      return leads;
    }
    return leads.filter(lead => lead['campaign id'] === campaignId);
  };

  // Handle campaign filter change
  const handleCampaignFilterChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    const filtered = filterLeadsByCampaign(allLeads, campaignId);
    setFilteredLeads(filtered);
    setSelectedLeadIndex(0); // Reset to first lead
    
    // Update form with first filtered lead
    if (filtered.length > 0) {
      updateFormWithLead(filtered[0]);
    }
  };

  // Update form when brand is selected
  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
  };



  // Fetch lead data from API
  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://evenbetterbuy.app.n8n.cloud/webhook/1af20e39-0067-4f50-87f1-d7cf47e21746');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        
        // Handle multiple possible API response formats
        let records: any[] = [];
        
        if (Array.isArray(apiData)) {
          records = apiData;
        } else if (apiData.body && Array.isArray(apiData.body)) {
          records = apiData.body;
        } else if (apiData.body && apiData.body.data && Array.isArray(apiData.body.data)) {
          records = apiData.body.data;
        } else {
          records = [apiData];
        }
        
        setAllLeads(records);
        setFilteredLeads(records);
        
        // Extract unique campaigns
        const uniqueCampaigns = extractCampaigns(records);
        setCampaigns(uniqueCampaigns);
        
        // Set first lead as selected but don't pre-fill generated content
        if (records.length > 0) {
          updateFormWithLead(records[0]);
        }
      } catch (error) {
        console.error('Error fetching lead data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, []);

  // Function to replace placeholders in text
  const replacePlaceholders = (text: string, lead: LeadData) => {
    if (!text) return text;
    
    return text
      .replace(/\[\[name\]\]/gi, lead.Name || 'User')
      .replace(/\[\[email\]\]/gi, lead.Email || lead['Personal Email'] || 'user@example.com')
      .replace(/\[\[phone\]\]/gi, lead.Phone || 'N/A')
      .replace(/\[\[company\]\]/gi, lead['Audience Type'] || 'Company')
      .replace(/\[\[status\]\]/gi, lead.Status || 'Active');
  };

  const updateFormWithLead = (lead: LeadData) => {
    setFormData(prev => ({
      ...prev,
      recipientName: lead.Name || '',
      recipientEmail: lead.Email || lead['Personal Email'] || '',
      recipientPhone: lead.Phone || '',
      // Keep existing generated content, don't overwrite with lead data
      subject: prev.subject || '',
      emailBody: prev.emailBody || '',
      smsContent: prev.smsContent || '',
      imageUrl: prev.imageUrl || '',
      emailImageUrl: prev.emailImageUrl || '',
      emailLandingPageUrl: prev.emailLandingPageUrl || '',
      sendEmailAsImage: prev.sendEmailAsImage,
    }));
  };

  const handleLeadChange = (index: number) => {
    setSelectedLeadIndex(index);
    updateFormWithLead(filteredLeads[index]);
  };

  const handleFormChange = (field: keyof CampaignForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset campaign saved state when content changes significantly
    if (['subject', 'emailBody', 'smsContent', 'campaignType'].includes(field)) {
      setIsCampaignSaved(false);
      setCurrentCampaignName('');
      setSavedCampaignId('');
    }
  };



  const handleTestCampaign = () => {
    if (formData.campaignType === 'email' || formData.campaignType === 'both') {
      // Check if sending email as image
      if (formData.sendEmailAsImage) {
        // When sending as image, only require subject and email image
        if (!formData.subject) {
          alert('Please fill in email subject before testing');
          return;
        }
        if (!formData.emailImageUrl) {
          alert('Please select a brand image for the email body before testing');
          return;
        }
      } else {
        // When sending as regular email, require subject and email body
        if (!formData.subject || !formData.emailBody) {
          alert('Please fill in both email subject and email body before testing');
          return;
        }
      }
      setIsTestEmailDialogOpen(true);
    } else if (formData.campaignType === 'sms') {
      if (!formData.smsContent) {
        alert('Please fill in MMS content before testing');
        return;
      }
      setIsTestMMSDialogOpen(true);
    }
  };

  const handleSendTestEmail = async (testEmail: string) => {
    try {
      setIsSendingTestEmail(true);
      
      let emailBodyContent = selectedLead ? replacePlaceholders(formData.emailBody, selectedLead) : formData.emailBody;
      
      // If sendEmailAsImage is enabled, use the selected brand image
      if (formData.sendEmailAsImage && formData.emailImageUrl) {
        console.log('Using selected brand image for email body:', formData.emailImageUrl);
        
        // Use the selected landing page URL for email body image
        const landingPageUrl = formData.emailLandingPageUrl || (selectedLandingPage ? `https://landing-page-bulder.vercel.app/landing/${selectedLandingPage.session_id}` : null);
        
        // Replace the email body with the selected image, optionally wrapped in a link
        if (landingPageUrl) {
          emailBodyContent = `<a href="${landingPageUrl}" target="_blank" style="display: block; text-decoration: none;">
            <img src="${formData.emailImageUrl}" alt="Email Content - Click to view landing page" style="max-width: 100%; height: auto; cursor: pointer;" />
          </a>`;
        } else {
          emailBodyContent = `<img src="${formData.emailImageUrl}" alt="Email Content" style="max-width: 100%; height: auto;" />`;
        }
      } else if (formData.sendEmailAsImage && !formData.emailImageUrl) {
        // If sendEmailAsImage is enabled but no image is selected, show warning
        alert('Please select a brand image for the email body when "Send Email as Image" is enabled.');
        return;
      }
      
      const response = await fetch('https://evenbetterbuy.app.n8n.cloud/webhook/f1bc25fc-3a15-41c2-8f74-06f1b66a94a5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toemail: testEmail,
          email_subject: selectedLead ? replacePlaceholders(formData.subject, selectedLead) : formData.subject,
          email_body: emailBodyContent
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Test email response:', result);
      
      // Show success dialog with response details
      setSuccessEmail(testEmail);
      setApiResponse(result);
      setIsTestEmailDialogOpen(false);
      setIsSuccessDialogOpen(true);
      
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error sending test email. Please try again.');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSendTestMMS = async (testPhone: string) => {
    try {
      setIsSendingTestMMS(true);
      
      // Format phone number to E.164 format
      let formattedPhone = testPhone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
        formattedPhone = '1' + formattedPhone;
      }
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      // Prepare the request body for Twilio API
      const requestBody = new URLSearchParams();
      requestBody.append('From', '+16029326821');
      requestBody.append('To', formattedPhone);
      requestBody.append('Body', selectedLead ? replacePlaceholders(formData.smsContent, selectedLead) : formData.smsContent);
      
      // Add image URL if available
      if (formData.imageUrl) {
        requestBody.append('MediaUrl', formData.imageUrl);
      }

      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/ACd9f9ab4b7cc09142a65425f40ffc030f/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('ACd9f9ab4b7cc09142a65425f40ffc030f:81ebfb7d037a48f754d4c8c71754dc9d'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Test MMS response:', result);
      
      // Show success dialog with response details
      setSuccessEmail(formattedPhone);
      setApiResponse(result);
      setIsTestMMSDialogOpen(false);
      setIsSuccessDialogOpen(true);
      
    } catch (error) {
      console.error('Error sending test MMS:', error);
      alert('Error sending test MMS. Please try again.');
    } finally {
      setIsSendingTestMMS(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!selectedBrand) {
      alert('Please select a brand first');
      return;
    }

    if (!formData.subject && !formData.emailBody && !formData.smsContent) {
      alert('Please add some content to your campaign before saving');
      return;
    }

    // If editing an existing campaign, update it directly
    if (editingCampaignId) {
      setIsCampaignNameDialogOpen(true);
      return;
    }

    // If campaign is already saved and has a name, don't save again
    if (isCampaignSaved && currentCampaignName) {
      alert('Campaign is already saved. You can edit the content and save again if needed.');
      return;
    }

    // If campaign has a name but not saved yet, or no name at all, show name dialog
    if (!currentCampaignName || !isCampaignSaved) {
      const defaultName = currentCampaignName || `Campaign - ${selectedBrand.brand_name} - ${new Date().toLocaleDateString()}`;
      setCurrentCampaignName(defaultName);
      setIsCampaignNameDialogOpen(true);
      return;
    }
  };

  const handleSaveCampaignWithName = async (campaignName: string, campaignType: 'email' | 'sms' | 'both') => {
    try {
      setIsSavingCampaign(true);
      
      // Update form data with selected campaign type
      setFormData(prev => ({
        ...prev,
        campaignType: campaignType
      }));

      // Prepare campaign data
      const campaignData = {
        campaign_name: campaignName,
        campaign_description: `Campaign for ${selectedBrand?.brand_name}`,
        campaign_type: campaignType,
        status: 'draft',
        brand_id: selectedBrand?.id,
        brand_name: selectedBrand?.brand_name,
        landing_page_id: selectedLandingPage?.id || null,
        landing_page_name: selectedLandingPage?.name || null,
        landing_page_url: selectedLandingPage ? `https://landing-page-bulder.vercel.app/landing/${selectedLandingPage.session_id}` : null,
        email_subject: formData.subject,
        email_body: formData.emailBody,
        send_email_as_image: formData.sendEmailAsImage,
        email_image_url: formData.emailImageUrl,
        email_landing_page_url: formData.emailLandingPageUrl,
        mms_text_content: formData.smsContent,
        mms_image_url: formData.imageUrl,
        selected_campaign_filter: selectedCampaignId === 'all' ? 'All Campaigns' : campaigns.find(c => c.id === selectedCampaignId)?.name || 'Unknown',
        lead_campaign_id: selectedCampaignId === 'all' ? null : selectedCampaignId,
        total_recipients: filteredLeads.length,
        created_by: 'User', // You can update this with actual user info
        tags: [selectedBrand?.brand_name, formData.campaignType, selectedLandingPage?.name].filter(Boolean),
        emails_sent: 0,
        emails_delivered: 0,
        emails_opened: 0,
        emails_clicked: 0,
        mms_sent: 0,
        mms_delivered: 0
      };

      let data, error;

      // Check if we're editing an existing campaign
      if (editingCampaignId) {
        // Update existing campaign
        const { data: updateData, error: updateError } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', editingCampaignId)
          .select()
          .single();
        
        data = updateData;
        error = updateError;
      } else {
        // Insert new campaign
        const { data: insertData, error: insertError } = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select()
          .single();
        
        data = insertData;
        error = insertError;
      }

      if (error) {
        console.error('Error saving campaign:', error);
        alert('Error saving campaign. Please try again.');
        return;
      }

      console.log('Campaign saved successfully:', data);
      
      // Update local state
      setCurrentCampaignName(campaignName);
      setIsCampaignSaved(true);
      setSavedCampaignId(data.id);
      setEditingCampaignId(data.id);
      
      // Close name dialog and show success dialog
      setIsCampaignNameDialogOpen(false);
      setSavedCampaignName(campaignName);
      setIsCampaignSavedDialogOpen(true);
      
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign. Please try again.');
    } finally {
      setIsSavingCampaign(false);
    }
  };

  // Handle image selection from ImageSelector
  const handleImageSelection = (selectedImages: string[]) => {
    if (selectedImages.length > 0) {
      // For MMS, we only allow one image
      setFormData(prev => ({
        ...prev,
        imageUrl: selectedImages[0]
      }));
    }
    setIsImageSelectorOpen(false);
  };

  // Handle email image selection from ImageSelector
  const handleEmailImageSelection = (selectedImages: string[]) => {
    if (selectedImages.length > 0) {
      // For email body, we only allow one image
      setFormData(prev => ({
        ...prev,
        emailImageUrl: selectedImages[0]
      }));
    }
    setIsEmailImageSelectorOpen(false);
  };

  const handleContinueEditing = () => {
    // Close the success dialog
    setIsCampaignSavedDialogOpen(false);
    
    // Navigate to the campaign edit URL with the campaign ID
    if (savedCampaignId) {
      router.push(`/email-mms-campaign?id=${savedCampaignId}`);
    }
  };



  // Handle content generation
  const handleGenerateContent = async (contentType: string, userInput: string, includeImage: boolean, includePurchaseLink: boolean, selectedLandingPageForGeneration: LandingPage | null) => {
    if (!selectedBrand) {
      alert('Please select a brand first');
      return;
    }

    try {
      setIsGenerating(true);
      
      const response = await fetch('https://evenbetterbuy.app.n8n.cloud/webhook/70e75e07-a792-4e68-983e-9e940e393de2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_id: selectedBrand.id,
          content_type: contentType,
          user_input: userInput,
          brand_name: selectedBrand.brand_name,
          brand_content: selectedBrand.brand_content || '',
          include_image: includeImage,
          include_purchase_link: false,
          product_images: selectedBrand.product_images || [],
          product_link: '',
          landing_page_url: selectedLandingPageForGeneration ? `https://landing-page-bulder.vercel.app/landing/${selectedLandingPageForGeneration.session_id}` : null,
          landing_page_name: selectedLandingPageForGeneration?.name || null
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Extract the generated content from the response
      let generatedContent = '';
      
      if (result.output && result.output.content) {
        generatedContent = result.output.content;
      } else if (result.body && result.body.generated_content) {
        generatedContent = result.body.generated_content;
      } else if (result.generated_content) {
        generatedContent = result.generated_content;
      } else if (typeof result === 'string') {
        generatedContent = result;
      } else {
        generatedContent = JSON.stringify(result);
      }

      // Update the appropriate form field based on content type
      switch (contentType) {
        case 'email_subject':
          setFormData(prev => ({ ...prev, subject: generatedContent }));
          break;
        case 'email_body':
          setFormData(prev => ({ ...prev, emailBody: generatedContent }));
          break;
        case 'mms_text':
          setFormData(prev => ({ ...prev, smsContent: generatedContent }));
          break;
      }

      // Close the dialog
      setIsGenerateDialogOpen(false);
      
      // Show success message
      
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Show loading overlay while loading campaign
  if (isLoadingCampaign) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Campaign...</h2>
            <p className="text-muted-foreground">Please wait while we load your campaign data.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show campaign not found message
  if (campaignNotFound) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <nav className="bg-card border-b border-border shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FaArrowLeft className="text-sm" />
                  <span className="text-sm font-medium">Back to Tools</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-bold text-lg text-foreground">Campaign Not Found</span>
              </div>
              <div className="w-24"></div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The campaign you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBack} variant="outline">
                Back to Tools
              </Button>
              <Button onClick={() => window.location.href = '/email-mms-campaign'}>
                Create New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-card border-b border-border shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm font-medium">Back to Tools</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-bold text-lg text-foreground">
                {editingCampaignId ? 'Edit Campaign' : 'Email/MMS Campaign'}
              </span>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Campaign Type Selection - Top */}
      <div className="bg-muted/20 border-b border-border flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Brand, Landing Page and Campaign Selection */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Brand Selection */}
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Brand:</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-64 justify-between"
                      disabled={fetchingBrands}
                    >
                      {fetchingBrands ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" size={14} />
                          Loading brands...
                        </>
                      ) : selectedBrand ? (
                        selectedBrand.brand_name
                      ) : (
                        'Select a brand'
                      )}
                      <FaChevronDown className="text-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-[200px] overflow-y-auto">
                    {brands.map((brand) => (
                      <DropdownMenuItem
                        key={brand.id}
                        onClick={() => handleBrandChange(brand)}
                        className="cursor-pointer"
                      >
                        {brand.brand_name}
                      </DropdownMenuItem>
                    ))}
                    {brands.length === 0 && !fetchingBrands && (
                      <DropdownMenuItem disabled>
                        No brands found
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>



              {/* Campaign Filter */}
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Campaign:</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-64 justify-between"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" size={14} />
                          Loading campaigns...
                        </>
                      ) : selectedCampaignId === 'all' ? (
                        'All Campaigns'
                      ) : (
                        campaigns.find(c => c.id === selectedCampaignId)?.name || 'Select Campaign'
                      )}
                      <FaChevronDown className="text-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-[200px] overflow-y-auto">
                    <DropdownMenuItem
                      onClick={() => handleCampaignFilterChange('all')}
                      className="cursor-pointer"
                    >
                      All Campaigns ({allLeads.length})
                    </DropdownMenuItem>
                    {campaigns.map((campaign) => (
                      <DropdownMenuItem
                        key={campaign.id}
                        onClick={() => handleCampaignFilterChange(campaign.id)}
                        className="cursor-pointer"
                      >
                        {campaign.name} ({filterLeadsByCampaign(allLeads, campaign.id).length})
                      </DropdownMenuItem>
                    ))}
                    {campaigns.length === 0 && !loading && (
                      <DropdownMenuItem disabled>
                        No campaigns found
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Campaign Type and Lead Selection */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Campaign Type:</Label>
                <div className="flex gap-2">
                  <Button
                    variant={formData.campaignType === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFormChange('campaignType', 'email')}
                  >
                    <FaEnvelope className="mr-2" />
                    Email
                  </Button>
                  <Button
                    variant={formData.campaignType === 'sms' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFormChange('campaignType', 'sms')}
                  >
                    <FaImage className="mr-2" />
                    MMS
                  </Button>
                  <Button
                    variant={formData.campaignType === 'both' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFormChange('campaignType', 'both')}
                  >
                    <div className="flex items-center gap-1">
                      <FaEnvelope className="text-xs" />
                      <FaImage className="text-xs" />
                    </div>
                    Both
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Lead Selection Dropdown */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Preview Lead:</Label>
                  <div className="relative">
                    <select
                      value={selectedLeadIndex}
                      onChange={(e) => handleLeadChange(Number(e.target.value))}
                      className="appearance-none bg-background border border-border rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      {filteredLeads.map((lead, index) => (
                        <option key={index} value={index}>
                          {lead.Name || `Lead ${index + 1}`} - {lead.Email || lead['Personal Email'] || 'No Email'}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" />
                  </div>
                </div>
                
                {/* Save Campaign Button */}
                <Button 
                  onClick={handleSaveCampaign}
                  className={isCampaignSaved ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                  disabled={loading || !selectedBrand || isSavingCampaign}
                >
                  {isSavingCampaign ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : isCampaignSaved ? (
                    <>
                      <FaPaperPlane className="mr-2" />
                      {editingCampaignId ? 'Update Campaign' : currentCampaignName ? `Saved: ${currentCampaignName.substring(0, 20)}${currentCampaignName.length > 20 ? '...' : ''}` : 'Campaign Saved'}
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      {editingCampaignId ? 'Update Campaign' : 'Save Campaign'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Side - Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-indigo-600" />
                      Campaign Configuration
                    </div>
                    {isCampaignSaved && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Saved
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Lead Information */}
                  {selectedLead && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Selected Lead Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Name</Label>
                          <p className="font-medium">{selectedLead.Name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">{selectedLead.Email || selectedLead['Personal Email']}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">{selectedLead.Phone}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <Badge variant={selectedLead.Status === 'Active' ? 'default' : 'secondary'}>
                            {selectedLead.Status}
                          </Badge>
                        </div>
                        {selectedLead['campaign name'] && (
                          <div>
                            <Label className="text-muted-foreground">Campaign</Label>
                            <p className="font-medium">{selectedLead['campaign name']}</p>
                          </div>
                        )}
                        {selectedLead['campaign id'] && (
                          <div>
                            <Label className="text-muted-foreground">campaign id</Label>
                            <p className="font-medium text-xs">{selectedLead['campaign id']}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Email Subject */}
                  {(formData.campaignType === 'email' || formData.campaignType === 'both') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subject">Email Subject</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentContentType('email_subject');
                            setIsGenerateDialogOpen(true);
                          }}
                          disabled={!selectedBrand}
                          className="text-xs"
                        >
                          <FaMagic className="mr-1" size={12} />
                          Generate
                        </Button>
                      </div>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleFormChange('subject', e.target.value)}
                        placeholder="Enter email subject or use AI generation... Use [[name]] for personalization"
                      />
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          💡 Available placeholders: [[name]], [[email]], [[phone]], [[company]], [[status]]
                        </p>
                        {!formData.subject && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            ✨ Click &ldquo;Generate&rdquo; to create AI-powered subject lines
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email Body */}
                  {(formData.campaignType === 'email' || formData.campaignType === 'both') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailBody">Email Body</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentContentType('email_body');
                            setIsGenerateDialogOpen(true);
                          }}
                          disabled={!selectedBrand}
                          className="text-xs"
                        >
                          <FaMagic className="mr-1" size={12} />
                          Generate
                        </Button>
                      </div>
                      <Textarea
                        id="emailBody"
                        value={formData.emailBody}
                        onChange={(e) => handleFormChange('emailBody', e.target.value)}
                        placeholder="Enter email body content or use AI generation... Use [[name]] for personalization"
                        rows={6}
                      />
                      
                      {/* Send Email as Image Option - Default checked */}
                      <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <input
                          type="checkbox"
                          id="sendEmailAsImage"
                          checked={formData.sendEmailAsImage}
                          onChange={(e) => handleFormChange('sendEmailAsImage', e.target.checked)}
                          className="rounded border-border"
                        />
                        <Label htmlFor="sendEmailAsImage" className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          📸 Send Email as Image (Recommended)
                        </Label>
                      </div>

                      {/* Email Image Selection - Only show when sendEmailAsImage is checked */}
                      {formData.sendEmailAsImage && (
                        <div className="space-y-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              🖼️ Select Brand Image for Email Body
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEmailImageSelectorOpen(true)}
                              className="text-xs bg-white dark:bg-gray-800"
                            >
                              <FaImage className="mr-1" size={12} />
                              Select Image
                            </Button>
                          </div>
                          
                          {/* Custom URL Input */}
                          <div className="space-y-2">
                            <Label htmlFor="emailImageUrl" className="text-sm text-muted-foreground">
                              Or enter custom image URL:
                            </Label>
                            <Input
                              id="emailImageUrl"
                              value={formData.emailImageUrl}
                              onChange={(e) => handleFormChange('emailImageUrl', e.target.value)}
                              placeholder="Enter custom image URL for email body..."
                            />
                          </div>

                          {/* Selected Email Image Preview */}
                          {formData.emailImageUrl && (
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Selected Email Image Preview:</Label>
                              <div className="relative">
                                <img
                                  src={formData.emailImageUrl}
                                  alt="Selected email image"
                                  className="w-full h-32 object-cover rounded-lg border border-border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-muted-foreground text-2xl mb-1">📷</div>
                                    <span className="text-xs text-muted-foreground">Image not available</span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFormChange('emailImageUrl', '')}
                                  className="absolute top-2 right-2 w-6 h-6 p-0 bg-background/80 hover:bg-background"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              💡 Select a brand image that will be embedded in the email body. This image will be clickable and link to your landing page.
                            </p>
                          </div>

                          {/* Landing Page Selection for Email Body */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              🌐 Select Landing Page for Email Body
                            </Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-between text-xs"
                                >
                                  {formData.emailLandingPageUrl ? (
                                    landingPages.find(lp => `https://landing-page-bulder.vercel.app/landing/${lp.session_id}` === formData.emailLandingPageUrl)?.name || 
                                    `Landing Page #${String(landingPages.find(lp => `https://landing-page-bulder.vercel.app/landing/${lp.session_id}` === formData.emailLandingPageUrl)?.id).slice(-8)}`
                                  ) : (
                                    'Select a landing page (optional)'
                                  )}
                                  <FaChevronDown className="text-xs" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-64 max-h-[200px] overflow-y-auto">
                                <DropdownMenuItem
                                  onClick={() => handleFormChange('emailLandingPageUrl', '')}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm">No landing page</span>
                                    <span className="text-xs text-muted-foreground">Image will not be clickable</span>
                                  </div>
                                </DropdownMenuItem>
                                {landingPages.map((landingPage) => (
                                  <DropdownMenuItem
                                    key={landingPage.id}
                                    onClick={() => handleFormChange('emailLandingPageUrl', `https://landing-page-bulder.vercel.app/landing/${landingPage.session_id}`)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm">{landingPage.name || `Landing Page #${String(landingPage.id).slice(-8)}`}</span>
                                      {landingPage.brand && (
                                        <span className="text-xs text-muted-foreground">Brand: {landingPage.brand}</span>
                                      )}
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                                {landingPages.length === 0 && (
                                  <DropdownMenuItem disabled>
                                    No landing pages found
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            {formData.emailLandingPageUrl && (
                              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  ✅ Email image will link to: {formData.emailLandingPageUrl}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          💡 Available placeholders: [[name]], [[email]], [[phone]], [[company]], [[status]]
                        </p>
                        {!formData.emailBody && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            ✨ Click &ldquo;Generate&rdquo; to create AI-powered email content
                          </p>
                        )}
                        {formData.sendEmailAsImage && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            🖼️ Email will contain the selected brand image as the main content
                            {formData.emailLandingPageUrl && (
                              <span className="block mt-1 text-green-600 dark:text-green-400">
                                🔗 Image will be clickable and link to landing page
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MMS Content */}
                  {(formData.campaignType === 'sms' || formData.campaignType === 'both') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smsContent">MMS Text Content</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentContentType('mms_text');
                            setIsGenerateDialogOpen(true);
                          }}
                          disabled={!selectedBrand}
                          className="text-xs"
                        >
                          <FaMagic className="mr-1" size={12} />
                          Generate
                        </Button>
                      </div>
                      <Textarea
                        id="smsContent"
                        value={formData.smsContent}
                        onChange={(e) => handleFormChange('smsContent', e.target.value)}
                        placeholder="Enter MMS text content or use AI generation... Use [[name]] for personalization"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.smsContent.length}/160 characters
                      </p>
                      {!formData.smsContent && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            ✨ Click &ldquo;Generate&rdquo; to create AI-powered MMS content
                          </p>
                        </div>
                      )}
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 MMS includes lead&apos;s actual profile image from &ldquo;Sent Image URL via Email&rdquo; and contact information
                        </p>
                      </div>
                      
                      {/* Image Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>MMS Image</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsImageSelectorOpen(true)}
                            className="text-xs"
                          >
                            <FaImage className="mr-1" size={12} />
                            Select Image
                          </Button>
                        </div>
                        
                        {/* Custom URL Input */}
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                            Or enter custom image URL:
                          </Label>
                          <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                            placeholder="Enter custom image URL for MMS..."
                          />
                        </div>

                        {/* Selected Image Preview */}
                        {formData.imageUrl && (
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Selected Image Preview:</Label>
                            <div className="relative">
                              <img
                                src={formData.imageUrl}
                                alt="Selected MMS image"
                                className="w-full h-32 object-cover rounded-lg border border-border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-muted-foreground text-2xl mb-1">📷</div>
                                  <span className="text-xs text-muted-foreground">Image not available</span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleFormChange('imageUrl', '')}
                                className="absolute top-2 right-2 w-6 h-6 p-0 bg-background/80 hover:bg-background"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 Select an image from your brand library or enter a custom URL. Leave empty to use brand&apos;s product images.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleTestCampaign}
                      className="w-full"
                      disabled={loading || isSendingTestEmail || isSendingTestMMS}
                    >
                      <FaEye className="mr-2" />
                      Test Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaEye className="text-indigo-600" />
                    Campaign Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Email Preview */}
                  {(formData.campaignType === 'email' || formData.campaignType === 'both') && (
                    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      {/* Gmail Header */}
                      <div className="bg-gray-50 dark:bg-gray-800 border-b px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {formData.recipientName ? formData.recipientName.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formData.recipientName || 'User'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.recipientEmail}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Now
                          </div>
                        </div>
                      </div>
                      
                      {/* Email Subject */}
                      <div className="px-4 py-3 border-b bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {selectedLead ? replacePlaceholders(formData.subject, selectedLead) : formData.subject}
                          </h3>
                          {formData.sendEmailAsImage && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                              📸 Image Email
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Email Body */}
                      <div className="px-4 py-4 bg-white dark:bg-gray-900">
                        {formData.sendEmailAsImage ? (
                          formData.emailImageUrl ? (
                            <div className="text-center">
                              <div className="relative">
                                <img
                                  src={formData.emailImageUrl}
                                  alt="Email content"
                                  className="w-full max-w-md mx-auto rounded-lg shadow-sm border border-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden text-center py-8">
                                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📸</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Selected brand image
                                  </p>
                                </div>
                              </div>
                              {formData.emailLandingPageUrl && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                  🌐 Image will be clickable and link to landing page
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Brand image selected for email body
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📸</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please select a brand image for email body
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Click &quot;Select Image&quot; above to choose a brand image
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: selectedLead ? replacePlaceholders(formData.emailBody, selectedLead) : formData.emailBody 
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Gmail Footer */}
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-t">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Reply</span>
                          <span>Forward</span>
                          <span>Delete</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MMS Preview */}
                  {(formData.campaignType === 'sms' || formData.campaignType === 'both') && (
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
                      <div className="flex items-center gap-2 mb-6">
                        <FaImage className="text-blue-600" />
                        <span className="text-lg font-semibold">MMS Preview</span>
                      </div>
                  
                      {/* Mobile Phone Mockup */}
                      <div className="mx-auto w-80 h-[600px] bg-white rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden">
                        {/* Phone Screen Content */}
                        <div className="w-full h-full bg-white flex flex-col">
                          {/* Status Bar */}
                          <div className="bg-black px-6 py-3 flex items-center justify-between text-xs text-white flex-shrink-0">
                            <span className="font-semibold">9:41</span>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-2 bg-white rounded-sm"></div>
                              <div className="w-4 h-2 bg-white rounded-sm"></div>
                              <div className="w-6 h-3 bg-white rounded-sm"></div>
                            </div>
                          </div>
                          
                          {/* Message Header */}
                          <div className="bg-gray-50 px-6 py-4 flex items-center gap-4 border-b border-gray-200 flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">←</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-lg font-bold">S</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-base">Sonic</span>
                                  <div className="text-xs text-green-500 font-medium">● Online</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Message Content */}
                          <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-gray-50">
                            {/* Text Message Bubble */}
                            <div className="flex justify-start">
                              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-5 py-3 max-w-xs shadow-sm border border-gray-100">
                                <p className="text-sm leading-relaxed">
                                  {selectedLead ? replacePlaceholders(formData.smsContent, selectedLead) : formData.smsContent || "Check out this amazing offer!"}
                                </p>
                              </div>
                            </div>
                            
                            {/* MMS Image */}
                            <div className="flex justify-start">
                              <div className="max-w-xs">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                  {formData.imageUrl ? (
                                    <img 
                                      key={formData.imageUrl}
                                      src={formData.imageUrl}
                                      alt="MMS Content"
                                      className="w-full h-56 object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="text-gray-400 text-4xl mb-2">📷</div>
                                        <span className="text-gray-500 text-sm">No image</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Message Input */}
                          <div className="bg-white px-6 py-4 border-t border-gray-200 flex-shrink-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                                <span className="text-gray-600 text-lg">📷</span>
                              </div>
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                                <span className="text-gray-600 text-lg">➕</span>
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-full px-5 py-3 border border-gray-200">
                                <span className="text-gray-500 text-sm">iMessage</span>
                              </div>
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                                <span className="text-white text-lg">↑</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                                        
                    </div>
                  )}

                  {/* Campaign Stats */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Campaign Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Recipients</Label>
                        <p className="font-medium">{filteredLeads.length}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Type</Label>
                        <p className="font-medium capitalize">{formData.campaignType}</p>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Dialog */}
      <GenerateDialog
        isOpen={isGenerateDialogOpen}
        onClose={() => setIsGenerateDialogOpen(false)}
        onGenerate={handleGenerateContent}
        selectedBrand={selectedBrand}
        selectedLandingPage={selectedLandingPage}
        setSelectedLandingPage={setSelectedLandingPage}
        landingPages={landingPages}
        isLoading={isGenerating}
        contentType={currentContentType}
      />

      {/* Test Email Dialog */}
      <TestEmailDialog
        isOpen={isTestEmailDialogOpen}
        onClose={() => setIsTestEmailDialogOpen(false)}
        onSubmit={handleSendTestEmail}
        isLoading={isSendingTestEmail}
      />

      {/* Test MMS Dialog */}
      <TestMMSDialog
        isOpen={isTestMMSDialogOpen}
        onClose={() => setIsTestMMSDialogOpen(false)}
        onSubmit={handleSendTestMMS}
        isLoading={isSendingTestMMS}
      />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        email={successEmail}
        response={apiResponse}
      />

      {/* Image Selector Dialog */}
      <ImageSelector
        open={isImageSelectorOpen}
        onOpenChange={setIsImageSelectorOpen}
        onImagesSelected={handleImageSelection}
        currentSelectedImages={formData.imageUrl ? [formData.imageUrl] : []}
        singleSelection={true}
      />

      {/* Email Image Selector Dialog */}
      <ImageSelector
        open={isEmailImageSelectorOpen}
        onOpenChange={setIsEmailImageSelectorOpen}
        onImagesSelected={handleEmailImageSelection}
        currentSelectedImages={formData.emailImageUrl ? [formData.emailImageUrl] : []}
        singleSelection={true}
      />

      {/* Campaign Saved Dialog */}
      <CampaignSavedDialog
        isOpen={isCampaignSavedDialogOpen}
        onClose={() => setIsCampaignSavedDialogOpen(false)}
        campaignName={savedCampaignName}
        campaignId={savedCampaignId}
        isEditing={!!editingCampaignId}
        onContinueEditing={handleContinueEditing}
      />

      {/* Campaign Name Dialog */}
      <CampaignNameDialog
        isOpen={isCampaignNameDialogOpen}
        onClose={() => setIsCampaignNameDialogOpen(false)}
        onSubmit={handleSaveCampaignWithName}
        isLoading={isSavingCampaign}
        defaultName={currentCampaignName}
        currentCampaignType={formData.campaignType}
        isEditing={!!editingCampaignId}
      />
    </div>
  );
}     