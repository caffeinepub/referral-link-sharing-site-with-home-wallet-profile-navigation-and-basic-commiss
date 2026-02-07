import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignInPanel() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in with Internet Identity to create referral links, track earnings, and manage your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Access to this application is restricted. You must be approved by an administrator to use the platform.
            </AlertDescription>
          </Alert>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with Internet Identity
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
