"use client";

import React, { useState, useEffect } from 'react';
import { FaTrash, FaEye, FaSpinner, FaRedo, FaPlus, FaExclamationTriangle, FaUpload, FaEdit, FaImage } from 'react-icons/fa';
import { supabase, Image } from '../lib/supabase';
import toast from 'react-hot-toast';
import UploadImageDialog from './UploadImageDialog';
import EditImageDialog from './EditImageDialog';

export default function ImagesTab() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

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
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  // Delete image
  const deleteImage = async (id: string | number) => {
    try {
      setDeletingId(String(id));
      
      // Delete using API route
      const response = await fetch(`/api/delete-image?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error deleting image:', result.error);
        toast.error(result.error || 'Failed to delete image');
        return;
      }

      setImages(prev => prev.filter(img => String(img.id) !== String(id)));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  };

  // Handle successful image upload
  const handleImageUploaded = () => {
    fetchImages();
  };

  // Handle successful image edit
  const handleImageEdited = () => {
    fetchImages();
  };

  // Open edit dialog
  const handleEditImage = (image: Image) => {
    setSelectedImage(image);
    setEditDialogOpen(true);
  };

  // Load data on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-primary" size={24} />
          <span className="text-muted-foreground">Loading images...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Images</h1>
          <p className="text-muted-foreground mt-1">
            Manage your uploaded images
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <FaRedo className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setUploadDialogOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200"
          >
            <FaUpload size={16} />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Images</p>
              <p className="text-2xl font-bold text-foreground">{images.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FaImage className="text-primary" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold text-foreground">
                {formatFileSize(images.reduce((acc, img) => acc + (img.file_size || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FaUpload className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Brands</p>
              <p className="text-2xl font-bold text-foreground">
                {new Set(images.filter(img => img.brand_name).map(img => img.brand_name)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <FaEdit className="text-green-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-muted-foreground" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No images found</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first image to get started
          </p>
          <button
            onClick={() => setUploadDialogOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200"
          >
            <FaUpload size={16} />
            <span>Upload Image</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              {/* Image Preview */}
              <div className="relative aspect-square bg-muted">
                <img
                  src={image.image_url}
                  alt={image.file_name || 'Image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NyA4OC41NDQ3IDgxIDEwMCA4MUMxMTAuNDU1IDgxIDExOSA4OS41NDQ3IDExOSAxMDBDMTE5IDExMC40NTUgMTEwLjQ1NSA5OSAxMDAgOTlDODguNTQ0NyA5OSA4MCA5MC40NTUzIDgwIDgwVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMjBDMTEwLjQ1NSAxMjAgMTE5IDExMS40NTUgMTE5IDEwMUMxMTkgOTAuNTQ0NyAxMTAuNDU1IDgyIDEwMCA4MkM4OS41NDQ3IDgyIDgxIDkwLjU0NDcgODEgMTAxQzgxIDExMS40NTUgODkuNTQ0NyAxMjAgMTAwIDEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      onClick={() => window.open(image.image_url, '_blank')}
                      className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-md transition-colors duration-200"
                      title="View Image"
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditImage(image)}
                      className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-md transition-colors duration-200"
                      title="Edit Image"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      disabled={deletingId === String(image.id)}
                      className="p-2 bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 rounded-md transition-colors duration-200 disabled:opacity-50"
                      title="Delete Image"
                    >
                      {deletingId === String(image.id) ? (
                        <FaSpinner className="animate-spin" size={16} />
                      ) : (
                        <FaTrash size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Image Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {image.file_name || `Image ${String(image.id).slice(0, 8)}`}
                    </h3>
                    {image.brand_name && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Brand: {image.brand_name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-mono">
                      {image.file_size ? formatFileSize(image.file_size) : 'Unknown'}
                    </span>
                  </div>
                  {image.mime_type && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-mono">
                        {image.mime_type}
                      </span>
                    </div>
                  )}
                  {image.created_at && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>
                        {formatDate(image.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Image Dialog */}
      <UploadImageDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleImageUploaded}
      />

      {/* Edit Image Dialog */}
      <EditImageDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleImageEdited}
        image={selectedImage}
      />
    </div>
  );
} 