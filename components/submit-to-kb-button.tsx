'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { submitCaptureToKnowledgeBase } from '@/app/(dashboard)/capture/submit-to-kb';
import { BookPlus } from 'lucide-react';

interface SubmitToKnowledgeBaseButtonProps {
  chatId: string;
  chatTitle: string;
  disabled?: boolean;
}

export function SubmitToKnowledgeBaseButton({
  chatId,
  chatTitle,
  disabled = false,
}: SubmitToKnowledgeBaseButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(chatTitle);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitCaptureToKnowledgeBase({
        chatId,
        title,
        description,
      });

      toast.success('Successfully submitted to knowledge base');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting to knowledge base:', error);
      toast.error('Failed to submit to knowledge base');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled}
        className="flex items-center gap-1"
      >
        <BookPlus size={16} />
        <span className="ml-1">Submit to Knowledge Base</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to Knowledge Base</DialogTitle>
            <DialogDescription>
              This will submit the capture session to the knowledge base for approval.
              Once approved, it will be available for querying.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this knowledge"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for this knowledge"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
