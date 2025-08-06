"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaSpinner, FaSave } from 'react-icons/fa';
import { supabase, Image } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface EditImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  image: Image | null;
}

export default function EditImageDialog({ open, onOpenChange, onSuccess, image }: EditImageDialogProps) {
  const [brandName, setBrandName] = useState('');
  const [saving, setSaving] = useState(false);

  // Update brand name when image changes
  useEffect(() => {
    if (image) {
      setBrandName(image.brand_name || '');
    }
  }, [image]);

  const handleSave = async () => {
    if (!image) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('images')
        .update({
          brand_name: brandName.trim() || null
        })
        .eq('id', image.id);

      if (error) {
        console.error('Update error:', error);
        toast.error('Failed to update image');
        return;
      }

      toast.success('Image updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update image');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setBrandName('');
    setSaving(false);
    onOpenChange(false);
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FaEdit className="text-primary" size={20} />
            <span>Edit Image</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview */}
          <div className="text-center">
            <img
              src={image.image_url}
              alt={image.file_name || 'Image'}
              className="max-w-full max-h-48 rounded-lg object-contain mx-auto"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {image.file_name || `Image ${image.id.slice(0, 8)}`}
            </p>
          </div>

          {/* Brand Name Input */}
          <div className="space-y-2">
            <label htmlFor="editBrandName" className="text-sm font-medium text-foreground">
              Brand Name
            </label>
            <Input
              id="editBrandName"
              type="text"
              placeholder="Enter brand name..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to remove brand association
            </p>
          </div>

          {/* Image Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">File Size:</span>
              <span className="font-mono">
                {image.file_size ? `${(image.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
              </span>
            </div>
            {image.mime_type && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-mono">{image.mime_type}</span>
              </div>
            )}
            {image.created_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploaded:</span>
                <span>{new Date(image.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 