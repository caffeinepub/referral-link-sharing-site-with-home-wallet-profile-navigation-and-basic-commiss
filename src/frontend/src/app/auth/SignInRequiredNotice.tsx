import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Lock } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';

export default function SignInRequiredNotice() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Sign In Required</CardTitle>
          <CardDescription className="text-base">
            This section requires you to sign in to access your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleLogin} disabled={isLoggingIn} size="lg">
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Internet Identity
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
