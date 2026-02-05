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
import { Loader2 } from 'lucide-react';
import { useWallet, useRequestPayout } from './useWallet';
import { useUserProfile } from '../profile/useUserProfile';
import { formatAmount } from '../utils/format';
import { toast } from 'sonner';

interface RequestPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestPayoutDialog({ open, onOpenChange }: RequestPayoutDialogProps) {
  const [amount, setAmount] = useState('');
  const { balance } = useWallet();
  const { data: profile } = useUserProfile();
  const requestPayoutMutation = useRequestPayout();

  const handleSubmit = async () => {
    if (!profile?.upi) {
      toast.error('Please set your UPI ID in Profile first');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await requestPayoutMutation.mutateAsync(BigInt(amountNum));
      toast.success('Payout request submitted successfully!');
      setAmount('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to request payout');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Enter the amount you want to withdraw to your UPI account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Available Balance</Label>
            <div className="text-2xl font-bold">{formatAmount(balance)}</div>
          </div>

          {profile?.upi ? (
            <div className="space-y-2">
              <Label>UPI ID</Label>
              <div className="text-sm text-muted-foreground">{profile.upi}</div>
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              Please set your UPI ID in Profile before requesting a payout
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!profile?.upi}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestPayoutMutation.isPending || !profile?.upi}
          >
            {requestPayoutMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
