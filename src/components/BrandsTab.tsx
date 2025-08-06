"use client";

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaImage, FaSpinner, FaTimes } from 'react-icons/fa';
import { supabase, Brand } from '../lib/supabase';
import toast from 'react-hot-toast';
import ImageSelector from './ImageSelector';

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    brand_name: '',
    brand_content: '',
    product_link: '',
    product_images: [] as string[]
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // Fetch brands from Supabase
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

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
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Add new brand
  const handleAddBrand = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([
          {
            brand_name: formData.brand_name,
            brand_content: formData.brand_content,
            brand_uuid: crypto.randomUUID(),
            product_link: formData.product_link || null,
            product_images: formData.product_images.length > 0 ? formData.product_images : null
          }
        ])
        .select();

      if (error) {
        console.error('Error adding brand:', error);
        toast.error('Failed to add brand');
        return;
      }

      toast.success('Brand added successfully');
      setShowAddModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('Failed to add brand');
    }
  };

  // Update brand
  const handleUpdateBrand = async () => {
    if (!editingBrand) return;

    try {
      const { error } = await supabase
        .from('brands')
        .update({
          brand_name: formData.brand_name,
          brand_content: formData.brand_content,
          product_link: formData.product_link || null,
          product_images: formData.product_images.length > 0 ? formData.product_images : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBrand.id);

      if (error) {
        console.error('Error updating brand:', error);
        toast.error('Failed to update brand');
        return;
      }

      toast.success('Brand updated successfully');
      setShowEditModal(false);
      setEditingBrand(null);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    }
  };

  // Delete brand
  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting brand:', error);
        toast.error('Failed to delete brand');
        return;
      }

      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      brand_name: '',
      brand_content: '',
      product_link: '',
      product_images: []
    });
    setNewImageUrl('');
  };

  // Open edit modal
  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      brand_name: brand.brand_name,
      brand_content: brand.brand_content,
      product_link: brand.product_link || '',
      product_images: brand.product_images || []
    });
    setShowEditModal(true);
  };

  // Add image URL
  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        product_images: [...prev.product_images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  // Remove image URL
  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      product_images: prev.product_images.filter((_, i) => i !== index)
    }));
  };

  // Handle image selection from ImageSelector
  const handleImagesSelected = (selectedImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      product_images: selectedImages
    }));
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto animate-fade-in relative flex flex-col">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in relative flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-card text-card-foreground rounded-t-xl px-8 py-4 mb-8 shadow-lg border border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
          <span className="font-bold text-xl tracking-tight">Brand Management</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus className="text-sm" />
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow">
            {/* Brand Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FaImage className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{brand.brand_name}</h3>
                  <p className="text-xs text-muted-foreground">ID: {brand.brand_uuid}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(brand)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand.id.toString())}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>

            {/* Brand Content */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{brand.brand_content}</p>
            </div>

            {/* Product Link */}
            {brand.product_link && (
              <div className="mb-4">
                <a
                  href={brand.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  <FaExternalLinkAlt className="text-xs" />
                  View Product
                </a>
              </div>
            )}

            {/* Product Images */}
            {brand.product_images && brand.product_images.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaImage className="text-sm text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Product Images ({brand.product_images.length})</span>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {brand.product_images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-12 h-12 object-cover rounded border border-border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxMkMxNiAxMC44OTU0IDE2Ljg5NTQgMTAgMTggMTBIMzBDMzEuMTA0NiAxMCAzMiAxMC44OTU0IDMyIDEyVjM2QzMyIDM3LjEwNDYgMzEuMTA0NiAzOCAzMCAzOEgxOEMxNi44OTU0IDM4IDE2IDM3LjEwNDYgMTYgMzZWMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  ))}
                  {brand.product_images.length > 3 && (
                    <div className="w-12 h-12 bg-muted rounded border border-border flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">+{brand.product_images.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Brand</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background"
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand Content</label>
                <textarea
                  value={formData.brand_content}
                  onChange={(e) => setFormData({ ...formData, brand_content: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background h-24"
                  placeholder="Enter brand description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Link (Optional)</label>
                <input
                  type="url"
                  value={formData.product_link}
                  onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background"
                  placeholder="https://example.com/product"
                />
              </div>
              
              {/* Image Selection Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="space-y-2">
                  {/* Selected Images Preview */}
                  {formData.product_images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {formData.product_images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Selected ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMS4zMzMzIDIxLjMzMzNDMjEuMzMzMyAxOS4xNzE2IDIzLjE3MTYgMTcuMzMzMyAyNS4zMzMzIDE3LjMzMzNIMzguNjY2N0M0MC44Mjg0IDE3LjMzMzMgNDIuNjY2NyAxOS4xNzE2IDQyLjY2NjcgMjEuMzMzM1Y0Mi42NjdDNDIuNjY2NyA0NC44Mjg0IDQwLjgyODQgNDYuNjY2NyAzOC42NjY3IDQ2LjY2NjdIMjUuMzMzM0MyMy4xNzE2IDQ2LjY2NjcgMjEuMzMzMyA0NC44Mjg0IDIxLjMzMzMgNDIuNjY3VjIxLjMzMzNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                          <button
                            onClick={() => removeImageUrl(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <FaTimes size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Selection Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowImageSelector(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm transition-colors"
                    >
                      <FaImage size={14} />
                      Select from Library
                    </button>
                  </div>
                  
                  {/* Manual URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 p-2 border border-border rounded bg-background text-sm"
                      placeholder="Or enter image URL manually"
                    />
                    <button
                      onClick={addImageUrl}
                      disabled={!newImageUrl.trim()}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBrand}
                disabled={!formData.brand_name.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors disabled:opacity-50"
              >
                Add Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Brand</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background"
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand Content</label>
                <textarea
                  value={formData.brand_content}
                  onChange={(e) => setFormData({ ...formData, brand_content: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background h-24"
                  placeholder="Enter brand description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Link (Optional)</label>
                <input
                  type="url"
                  value={formData.product_link}
                  onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-background"
                  placeholder="https://example.com/product"
                />
              </div>
              
              {/* Image Selection Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="space-y-2">
                  {/* Selected Images Preview */}
                  {formData.product_images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {formData.product_images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Selected ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMS4zMzMzIDIxLjMzMzNDMjEuMzMzMyAxOS4xNzE2IDIzLjE3MTYgMTcuMzMzMyAyNS4zMzMzIDE3LjMzMzNIMzguNjY2N0M0MC44Mjg0IDE3LjMzMzMgNDIuNjY2NyAxOS4xNzE2IDQyLjY2NjcgMjEuMzMzM1Y0Mi42NjdDNDIuNjY2NyA0NC44Mjg0IDQwLjgyODQgNDYuNjY2NyAzOC42NjY3IDQ2LjY2NjdIMjUuMzMzM0MyMy4xNzE2IDQ2LjY2NjcgMjEuMzMzMyA0NC44Mjg0IDIxLjMzMzMgNDIuNjY3VjIxLjMzMzNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                          <button
                            onClick={() => removeImageUrl(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <FaTimes size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Selection Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowImageSelector(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm transition-colors"
                    >
                      <FaImage size={14} />
                      Select from Library
                    </button>
                  </div>
                  
                  {/* Manual URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 p-2 border border-border rounded bg-background text-sm"
                      placeholder="Or enter image URL manually"
                    />
                    <button
                      onClick={addImageUrl}
                      disabled={!newImageUrl.trim()}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBrand(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBrand}
                disabled={!formData.brand_name.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors disabled:opacity-50"
              >
                Update Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Selector */}
      <ImageSelector
        open={showImageSelector}
        onOpenChange={setShowImageSelector}
        onImagesSelected={handleImagesSelected}
        currentSelectedImages={formData.product_images}
      />
    </div>
  );
} 