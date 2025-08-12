"use client";

import React, { useState } from 'react';
import { FaCode, FaSpinner, FaSave } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface EditHeaderCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landingPage: {
    id: string | number;
    name?: string;
    header_code?: string;
  } | null;
  onSuccess: () => void;
}

export default function EditHeaderCodeDialog({
  open,
  onOpenChange,
  landingPage,
  onSuccess,
}: EditHeaderCodeDialogProps) {
  const [headerCode, setHeaderCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or landing page changes
  React.useEffect(() => {
    if (open && landingPage) {
      setHeaderCode(landingPage.header_code || '');
    }
  }, [open, landingPage]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!landingPage) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('landingpages')
        .update({ header_code: headerCode })
        .eq('id', landingPage.id);

      if (error) {
        console.error('Error updating header code:', error);
        toast.error('Failed to update header code');
        return;
      }

      toast.success('Header code updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating header code:', error);
      toast.error('Failed to update header code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FaCode className="text-primary" size={20} />
            <span>Edit Header Code</span>
          </DialogTitle>
          <DialogDescription>
            {landingPage?.name ? (
              <>Edit the header code for {landingPage.name}</>
            ) : (
              <>Edit the header code for this landing page</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 h-full">
            <div className="flex-1 min-h-0">
              <label htmlFor="header-code" className="block text-sm font-medium text-foreground mb-2">
                Header Code (HTML/CSS/JavaScript)
              </label>
              <Textarea
                id="header-code"
                value={headerCode}
                onChange={(e) => setHeaderCode(e.target.value)}
                placeholder="Enter your header code here (HTML, CSS, JavaScript)..."
                className="h-full min-h-[400px] font-mono text-sm resize-none"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
              />
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-medium mb-1">💡 Tips:</p>
              <ul className="space-y-1">
                <li>• This code will be inserted in the &lt;head&gt; section of your landing page</li>
                <li>• You can include HTML, CSS, JavaScript, meta tags, and external resources</li>
                <li>• Common uses: custom fonts, analytics scripts, meta tags, custom CSS</li>
                <li>• The code will be applied to all pages using this landing page template</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" size={14} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave size={14} />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 