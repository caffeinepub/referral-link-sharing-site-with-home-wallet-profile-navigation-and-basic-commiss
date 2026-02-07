import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileJson, Info } from 'lucide-react';
import { useBulkAddTasks } from './useAvailableTasks';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateAndParseTasksJson } from './taskJsonValidation';

interface GooglePayTasksUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GooglePayTasksUploadDialog({ open, onOpenChange }: GooglePayTasksUploadDialogProps) {
  const [tasksInput, setTasksInput] = useState('');
  const bulkAddTasksMutation = useBulkAddTasks();

  const handleSubmit = async () => {
    if (!tasksInput.trim()) {
      toast.error('Please enter tasks to upload');
      return;
    }

    // Use shared validation helper
    const validatedTasks = validateAndParseTasksJson(tasksInput);
    if (!validatedTasks) {
      return; // Validation errors are already shown via toast
    }

    try {
      // Submit to backend
      await bulkAddTasksMutation.mutateAsync(validatedTasks);

      // Success - clear input and close dialog
      setTasksInput('');
      toast.success(`Successfully uploaded ${validatedTasks.length} Google Pay task${validatedTasks.length > 1 ? 's' : ''}!`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload Google Pay tasks');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Google Pay Tasks</DialogTitle>
          <DialogDescription>
            Upload multiple Google Pay tasks at once by pasting a JSON array
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Format:</strong> Paste a JSON array of tasks. Each task must have a{' '}
              <code className="bg-muted px-1 py-0.5 rounded">title</code> and{' '}
              <code className="bg-muted px-1 py-0.5 rounded">description</code>.{' '}
              <code className="bg-muted px-1 py-0.5 rounded">reward</code> is optional (in rupees).
              <br />
              <strong>Example:</strong>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                {`[
  {
    "title": "Google Pay Referral",
    "description": "Refer a friend to Google Pay",
    "reward": 100
  },
  {
    "title": "Complete Payment",
    "description": "Make your first payment using Google Pay",
    "reward": 50
  }
]`}
              </pre>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="google-pay-tasks-input">Google Pay Tasks JSON *</Label>
            <Textarea
              id="google-pay-tasks-input"
              placeholder='[{"title": "Google Pay Task", "description": "Complete this task", "reward": 100}]'
              value={tasksInput}
              onChange={(e) => setTasksInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkAddTasksMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bulkAddTasksMutation.isPending}>
            {bulkAddTasksMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4 mr-2" />
                Upload Google Pay Tasks
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
