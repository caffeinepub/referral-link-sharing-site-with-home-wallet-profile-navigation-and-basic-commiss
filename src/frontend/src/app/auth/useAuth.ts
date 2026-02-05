import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';

export function useAuth() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principalString = identity?.getPrincipal().toString() || '';

  return {
    isAuthenticated,
    principalString,
    identity,
    actor,
  };
}
