import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useReferralRedirect } from './useReferralRedirect';

export default function ReferralRedirect() {
  const { status, destinationUrl, error } = useReferralRedirect();

  useEffect(() => {
    if (status === 'success' && destinationUrl) {
      window.location.href = destinationUrl;
    }
  }, [status, destinationUrl]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Processing referral...</p>
            <p className="text-sm text-muted-foreground mt-2">
              You'll be redirected shortly
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <CardTitle>Invalid Referral Link</CardTitle>
            </div>
            <CardDescription>{error || 'This referral link is not valid'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return null;
}
