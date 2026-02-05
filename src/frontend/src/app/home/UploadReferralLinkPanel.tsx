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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { useCreateReferralLink } from './useReferralLinks';
import { toast } from 'sonner';

interface UploadReferralLinkPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadReferralLinkPanel({
  open,
  onOpenChange,
}: UploadReferralLinkPanelProps) {
  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [commission, setCommission] = useState('');

  const createMutation = useCreateReferralLink();

  const handleSubmit = async () => {
    if (!title.trim() || !destinationUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const commissionValue = commission.trim() ? BigInt(commission) : null;
      await createMutation.mutateAsync({
        title: title.trim(),
        destinationUrl: destinationUrl.trim(),
        commission: commissionValue,
      });

      setTitle('');
      setDestinationUrl('');
      setCommission('');
      toast.success('Referral link created successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create referral link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Referral Link</DialogTitle>
          <DialogDescription>
            Create a new referral link to share and earn commission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="upload-title">Title *</Label>
            <Input
              id="upload-title"
              placeholder="e.g., My Favorite App"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-url">Destination URL *</Label>
            <Input
              id="upload-url"
              type="url"
              placeholder="https://example.com"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-commission">Commission (optional)</Label>
            <Input
              id="upload-commission"
              type="number"
              placeholder="e.g., 100"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
