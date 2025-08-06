"use client";

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPlus } from 'react-icons/fa';
import { supabase, Brand } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CreateLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateLandingPageDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLandingPageDialogProps) {
  const [landingPageName, setLandingPageName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBrands, setFetchingBrands] = useState(false);

  // Fetch brands from Supabase
  const fetchBrands = async () => {
    try {
      setFetchingBrands(true);
      const { data, error } = await supabase
        .from('brands')
        .select('id, brand_name, brand_content, brand_uuid, created_at')
        .order('brand_name', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to fetch brands');
        return;
      }

      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to fetch brands');
    } finally {
      setFetchingBrands(false);
    }
  };

  // Load brands when dialog opens
  useEffect(() => {
    if (open) {
      fetchBrands();
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setLandingPageName('');
      setSelectedBrand(null);
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!landingPageName.trim()) {
      toast.error('Please enter a landing page name');
      return;
    }

    if (!selectedBrand) {
      toast.error('Please select a brand');
      return;
    }

    try {
      setLoading(true);
      
      // Generate a unique session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('landingpages')
        .insert({
          name: landingPageName.trim(),
          brand: selectedBrand.brand_name,
          session_id: sessionId,
          html_code: '', // Empty initially
          images: [], // Empty array initially
          purchase_link: '', // Empty initially
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating landing page:', error);
        toast.error('Failed to create landing page');
        return;
      }

      toast.success('Landing page created successfully!');
      onSuccess();
      onOpenChange(false);
      
      // Open the landing page builder with the new session ID
      window.open(`/landing-page-builder?session=${sessionId}`, '_blank');
    } catch (error) {
      console.error('Error creating landing page:', error);
      toast.error('Failed to create landing page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Landing Page</DialogTitle>
          <DialogDescription>
            Enter the details for your new landing page. You can customize it further after creation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="landing-page-name" className="text-sm font-medium">
              Landing Page Name
            </label>
            <Input
              id="landing-page-name"
              type="text"
              placeholder="Enter landing page name"
              value={landingPageName}
              onChange={(e) => setLandingPageName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px] max-h-[200px] overflow-y-auto">
                {brands.map((brand) => (
                  <DropdownMenuItem
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand)}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !landingPageName.trim() || !selectedBrand}>
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" size={14} />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" size={14} />
                  Create Landing Page
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 