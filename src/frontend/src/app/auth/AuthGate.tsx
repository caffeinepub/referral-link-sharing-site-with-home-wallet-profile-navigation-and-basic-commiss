import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import SignInPanel from './SignInPanel';
import BlockedAccessScreen from './BlockedAccessScreen';
import { useIsAllowedUser } from './useIsAllowedUser';
import { useIsAdmin } from './useIsAdmin';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: isAllowed, isLoading: isCheckingAllowlist, isFetched: allowlistFetched } = useIsAllowedUser();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched: adminFetched } = useIsAdmin();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPanel />;
  }

  // Check both admin status and allowlist status after authentication
  const isCheckingAccess = isCheckingAllowlist || isCheckingAdmin || !allowlistFetched || !adminFetched;
  
  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Allow access if user is admin OR approved
  const hasAccess = isAdmin || isAllowed;

  if (!hasAccess) {
    return <BlockedAccessScreen />;
  }

  return <>{children}</>;
}
