"use client";

import React, { useState, useEffect } from 'react';
import { FaTrash, FaEye, FaSpinner, FaRedo, FaPlus, FaExclamationTriangle, FaEdit, FaCode } from 'react-icons/fa';
import { supabase, LandingPage } from '../lib/supabase';
import toast from 'react-hot-toast';
import CreateLandingPageDialog from './CreateLandingPageDialog';
import EditHeaderCodeDialog from './EditHeaderCodeDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

export default function LandingPagesTab() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<LandingPage | null>(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [pageToEditCode, setPageToEditCode] = useState<LandingPage | null>(null);

  // Fetch landing pages from Supabase
  const fetchLandingPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landingpages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching landing pages:', error);
        toast.error('Failed to fetch landing pages');
        return;
      }

      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast.error('Failed to fetch landing pages');
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = (page: LandingPage) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  // Show code editing dialog
  const showCodeDialog = (page: LandingPage) => {
    setPageToEditCode(page);
    setCodeDialogOpen(true);
  };

  // Delete landing page
  const deleteLandingPage = async () => {
    if (!pageToDelete) return;

    try {
      setDeletingId(String(pageToDelete.id));
      const { error } = await supabase
        .from('landingpages')
        .delete()
        .eq('id', pageToDelete.id);

      if (error) {
        console.error('Error deleting landing page:', error);
        toast.error('Failed to delete landing page');
        return;
      }

      setLandingPages(prev => prev.filter(page => page.id !== pageToDelete.id));
      toast.success('Landing page deleted successfully');
    } catch (error) {
      console.error('Error deleting landing page:', error);
      toast.error('Failed to delete landing page');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLandingPages();
    setRefreshing(false);
  };

  // Handle successful landing page creation
  const handleLandingPageCreated = () => {
    fetchLandingPages();
  };

  // Load data on component mount
  useEffect(() => {
    fetchLandingPages();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-primary" size={24} />
          <span className="text-muted-foreground">Loading landing pages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Landing Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage your generated landing pages
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
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200"
          >
            <FaPlus size={16} />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pages</p>
              <p className="text-2xl font-bold text-foreground">{landingPages.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FaEye className="text-primary" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Landing Pages Grid */}
      {landingPages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-muted-foreground" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No landing pages found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first landing page to get started
          </p>
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200"
          >
            <FaPlus size={16} />
            <span>Create Landing Page</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {landingPages.map((page) => (
            <div
              key={page.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {page.name || `Landing Page #${String(page.id).slice(-8)}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {page.brand && <span className="mr-2">Brand: {page.brand}</span>}
                    Session: {String(page.session_id).slice(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`https://landing-page-bulder.vercel.app/landing/${page.session_id}`, '_blank')}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200"
                    title="View Landing Page"
                  >
                    <FaEye size={16} />
                  </button>
                  <button
                    onClick={() => window.open(`https://n8n-custom-ui-dashobard.vercel.app/landing-page-builder?session=${page.session_id}`, '_blank')}
                    className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    title="Edit Landing Page"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => showCodeDialog(page)}
                    className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
                    title="Edit Header Code"
                  >
                    <FaCode size={16} />
                  </button>
                  <button
                    onClick={() => showDeleteConfirmation(page)}
                    disabled={deletingId === page.id}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-200 disabled:opacity-50"
                    title="Delete Landing Page"
                  >
                    {deletingId === page.id ? (
                      <FaSpinner className="animate-spin" size={16} />
                    ) : (
                      <FaTrash size={16} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {String(page.id).slice(0, 8)}...
                  </span>
                </div>
                {page.brand && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="text-xs font-medium">
                      {page.brand}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Session ID:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {String(page.session_id).slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Header Code:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    page.header_code ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {page.header_code ? 'Present' : 'None'}
                  </span>
                </div>
                {page.created_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-xs">
                      {formatDate(page.created_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Landing Page Dialog */}
      <CreateLandingPageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleLandingPageCreated}
      />

      {/* Edit Header Code Dialog */}
      <EditHeaderCodeDialog
        open={codeDialogOpen}
        onOpenChange={setCodeDialogOpen}
        landingPage={pageToEditCode}
        onSuccess={handleLandingPageCreated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Landing Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this landing page? This action cannot be undone.
              {pageToDelete && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">{pageToDelete.name || `Landing Page #${String(pageToDelete.id).slice(-8)}`}</p>
                  <p className="text-xs text-muted-foreground">Session: {String(pageToDelete.session_id).slice(0, 8)}...</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteLandingPage}
              disabled={deletingId !== null}
            >
              {deletingId ? (
                <>
                  <FaSpinner className="animate-spin mr-2" size={14} />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 