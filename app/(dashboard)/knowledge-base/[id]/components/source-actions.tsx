'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Trash, MessageSquare } from 'lucide-react';
import { updateSourceStatus, deleteSource } from '../../actions';
import { KnowledgeSource } from '@/lib/db/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLoadingState, LoadingOverlay, ErrorDisplay } from '../../components/loading-states';

interface SourceActionsProps {
  source: KnowledgeSource;
}

export function SourceActions({ source }: SourceActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  
  // Use our custom loading state hook
  const {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage
  } = useLoadingState();

  const handleApprove = async () => {
    startLoading();
    try {
      await updateSourceStatus(source.id, 'approved');
      toast.success('Knowledge source approved');
      router.refresh(); // Refresh the page to show updated status
    } catch (error) {
      console.error('Error approving knowledge source:', error);
      setErrorMessage('Failed to approve knowledge source');
      toast.error('Failed to approve knowledge source');
    } finally {
      stopLoading();
    }
  };

  const handleReject = async () => {
    startLoading();
    try {
      await updateSourceStatus(source.id, 'rejected');
      toast.success('Knowledge source rejected');
      router.refresh(); // Refresh the page to show updated status
    } catch (error) {
      console.error('Error rejecting knowledge source:', error);
      setErrorMessage('Failed to reject knowledge source');
      toast.error('Failed to reject knowledge source');
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async () => {
    startLoading();
    try {
      await deleteSource(source.id);
      toast.success('Knowledge source deleted successfully');
      router.push('/knowledge-base');
    } catch (error) {
      console.error('Error deleting knowledge source:', error);
      setErrorMessage('Failed to delete knowledge source');
      toast.error('Failed to delete knowledge source');
      stopLoading();
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      {/* Show error message if there is one */}
      {error && (
        <ErrorDisplay
          message={error}
          onRetry={() => router.refresh()}
        />
      )}
      
      {/* Loading overlay for async operations */}
      <LoadingOverlay
        isLoading={isLoading}
        message={
          showDeleteDialog ? "Deleting knowledge source..." :
          "Updating knowledge source status..."
        }
      />
      
      <div className="flex gap-2">
        {source.status === 'pending' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={isLoading}
            >
              <CheckCircle size={16} className="mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
            >
              <XCircle size={16} className="mr-2" />
              Reject
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/query/new?sourceId=${source.id}`)}
          disabled={isLoading}
        >
          <MessageSquare size={16} className="mr-2" />
          Query
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
        >
          <Trash size={16} className="mr-2" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              knowledge source and all associated chunks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}