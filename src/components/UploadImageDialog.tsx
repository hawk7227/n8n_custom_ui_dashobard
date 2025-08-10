"use client";

import React, { useState, useRef } from 'react';
import { FaUpload, FaSpinner, FaTimes, FaImage, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface UploadImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FileWithPreview {
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadImageDialog({ open, onOpenChange, onSuccess }: UploadImageDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [brandName, setBrandName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: FileWithPreview[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        file,
        previewUrl,
        status: 'pending'
      });
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      setUploading(true);

      // Update status to uploading for all files
      setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('brandName', brandName);
      
      selectedFiles.forEach((fileWithPreview, index) => {
        formData.append(`files[${index}]`, fileWithPreview.file);
      });

      // Upload using API route
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Upload error:', result.error);
        toast.error(result.error || 'Failed to upload images');
        setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, error: 'Upload failed' })));
        return;
      }

      // Update file statuses based on results
      const { uploaded, errors } = result;
      
      setSelectedFiles(prev => prev.map((fileWithPreview, index) => {
        const uploadedFile = uploaded.find((u: any) => u.file_name === fileWithPreview.file.name);
        const error = errors.find((e: any) => e.fileName === fileWithPreview.file.name);
        
        if (uploadedFile) {
          return { ...fileWithPreview, status: 'success' as const };
        } else if (error) {
          return { ...fileWithPreview, status: 'error' as const, error: error.error };
        } else {
          return { ...fileWithPreview, status: 'error' as const, error: 'Unknown error' };
        }
      }));

      // Show summary toast
      const { summary } = result;
      if (summary.successful > 0) {
        toast.success(`Successfully uploaded ${summary.successful} of ${summary.total} images`);
      }
      if (summary.failed > 0) {
        toast.error(`${summary.failed} images failed to upload`);
      }

      // Call onSuccess if any files were uploaded successfully
      if (summary.successful > 0) {
        onSuccess();
      }

      // Auto-close after a delay if all uploads were successful
      if (summary.failed === 0) {
        setTimeout(() => handleClose(), 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
      setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, error: 'Upload failed' })));
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    selectedFiles.forEach(fileWithPreview => {
      URL.revokeObjectURL(fileWithPreview.previewUrl);
    });
    setSelectedFiles([]);
    setBrandName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const newFiles: FileWithPreview[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        file,
        previewUrl,
        status: 'pending'
      });
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaImage className="text-muted-foreground" size={16} />;
      case 'uploading':
        return <FaSpinner className="animate-spin text-blue-500" size={16} />;
      case 'success':
        return <FaCheck className="text-green-500" size={16} />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" size={16} />;
      default:
        return <FaImage className="text-muted-foreground" size={16} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FaUpload className="text-primary" size={20} />
            <span>Upload Images</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors duration-200"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((fileWithPreview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative">
                        <img
                          src={fileWithPreview.previewUrl}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute top-1 right-1">
                          {getStatusIcon(fileWithPreview.status)}
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {fileWithPreview.file.name}
                      </p>
                      {fileWithPreview.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {fileWithPreview.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FaImage className="text-muted-foreground" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop images here, or click to select multiple files
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <FaUpload className="mr-2" size={16} />
                    Select Images
                  </Button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Brand Name Input */}
          <div className="space-y-2">
            <label htmlFor="brandName" className="text-sm font-medium text-foreground">
              Brand Name (Optional)
            </label>
            <Input
              id="brandName"
              type="text"
              placeholder="Enter brand name for all images..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>

          {/* Upload Button */}
          <div className="flex space-x-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" size={16} />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" size={16} />
                  Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 