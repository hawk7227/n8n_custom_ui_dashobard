"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaCheck, FaSpinner, FaImage, FaPlus } from 'react-icons/fa';
import { supabase, Image } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import UploadImageDialog from './UploadImageDialog';

interface ImageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesSelected: (selectedImages: string[]) => void;
  currentSelectedImages?: string[];
  singleSelection?: boolean;
}

export default function ImageSelector({ 
  open, 
  onOpenChange, 
  onImagesSelected, 
  currentSelectedImages = [],
  singleSelection = false
}: ImageSelectorProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>(currentSelectedImages);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch images from Supabase
  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to fetch images');
        return;
      }

      setImages(data || []);
      setFilteredImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  // Filter images based on search term
  useEffect(() => {
    const filtered = images.filter(image => {
      const searchLower = searchTerm.toLowerCase();
      return (
        image.file_name?.toLowerCase().includes(searchLower) ||
        image.brand_name?.toLowerCase().includes(searchLower) ||
        image.image_url.toLowerCase().includes(searchLower)
      );
    });
    setFilteredImages(filtered);
  }, [searchTerm, images]);

  // Load images when dialog opens
  useEffect(() => {
    if (open) {
      fetchImages();
      setSelectedImages(currentSelectedImages);
    }
  }, [open, currentSelectedImages]);

  // Handle image selection
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        if (singleSelection) {
          // For single selection, replace the current selection
          return [imageUrl];
        } else {
          // For multiple selection, add to the list
          return [...prev, imageUrl];
        }
      }
    });
  };

  // Handle confirm selection
  const handleConfirm = () => {
    onImagesSelected(selectedImages);
    onOpenChange(false);
    setSearchTerm('');
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedImages(currentSelectedImages);
    setSearchTerm('');
    onOpenChange(false);
  };

  // Handle successful image upload
  const handleImageUploaded = () => {
    fetchImages(); // Refresh the images list
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <FaImage className="text-primary" size={20} />
            <span>{singleSelection ? 'Select Image' : 'Select Images'}</span>
            {selectedImages.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({selectedImages.length} selected)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Search Bar and Add Image Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search images by name, brand, or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <FaTimes size={16} />
                </button>
              )}
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              size="sm"
              className="flex-shrink-0"
            >
              <FaPlus className="mr-2" size={14} />
              Add Image
            </Button>
          </div>

          {/* Images Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-primary" size={24} />
                  <span className="text-muted-foreground">Loading images...</span>
                </div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaImage className="text-muted-foreground" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm ? 'No images found' : 'No images available'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload some images first'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => {
                  const isSelected = selectedImages.includes(image.image_url);
                  return (
                    <div
                      key={image.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleImageSelection(image.image_url)}
                    >
                      {/* Image */}
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={image.image_url}
                          alt={image.file_name || 'Image'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC41NDQ3IDgxIDEwMCA4MUMxMTAuNDU1IDgxIDExOSA4OS41NDQ3IDExOSAxMDBDMTE5IDExMC40NTUgMTEwLjQ1NSA5OSAxMDAgOTlDODguNTQ0NyA5OSA4MCA5MC40NTUzIDgwIDgwVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMjBDMTEwLjQ1NSAxMjAgMTE5IDExMS40NTUgMTE5IDEwMUMxMTkgOTAuNTQ0NyAxMTAuNDU1IDgyIDEwMCA4MkM4OS41NDQ3IDgyIDgxIDkwLjU0NDcgODEgMTAxQzgxIDExMS40NTUgODkuNTQ0NyAxMjAgMTAwIDEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                        
                        {/* Selection Overlay */}
                        <div className={`absolute inset-0 transition-all duration-200 ${
                          isSelected 
                            ? 'bg-primary/20' 
                            : 'bg-black/0 group-hover:bg-black/10'
                        }`}>
                          {/* Selection Checkbox */}
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-white/80 text-muted-foreground group-hover:bg-white'
                          }`}>
                            {isSelected && <FaCheck size={12} />}
                          </div>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="p-2 bg-background/95 backdrop-blur-sm">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {image.file_name || `Image ${String(image.id).slice(0, 8)}`}
                          </p>
                          {image.brand_name && (
                            <p className="text-xs text-muted-foreground truncate">
                              Brand: {image.brand_name}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{image.file_size ? formatFileSize(image.file_size) : 'Unknown'}</span>
                            <span>{image.mime_type?.split('/')[1]?.toUpperCase() || 'IMG'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedImages.length === 0}
              >
                Confirm Selection ({selectedImages.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Upload Image Dialog */}
      <UploadImageDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleImageUploaded}
      />
    </Dialog>
  );
} 