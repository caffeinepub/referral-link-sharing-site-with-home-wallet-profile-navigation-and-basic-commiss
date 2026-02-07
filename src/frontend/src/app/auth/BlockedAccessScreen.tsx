import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import SignOutButton from './SignOutButton';

export default function BlockedAccessScreen() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
          <CardDescription className="text-base">
            Your account is not currently allowed to access this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm text-center">
            <p className="mb-2">
              Please contact the administrator to request access to this platform.
            </p>
            <p className="text-muted-foreground">
              Once your account is approved, you'll be able to use all features.
            </p>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
