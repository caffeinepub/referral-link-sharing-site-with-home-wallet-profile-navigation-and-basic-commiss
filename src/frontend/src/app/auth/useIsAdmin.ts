import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

const ADMIN_PRINCIPAL = 'lv4e6-aruzu-to76z-gr2e6-edqal-fz764-2qtjs-57xeh-4ik7q-jkiek-zae';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const currentPrincipal = identity?.getPrincipal().toString() || '';

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', currentPrincipal],
    queryFn: async () => {
      if (!actor) return false;
      
      // Short-circuit for the designated admin principal
      if (currentPrincipal === ADMIN_PRINCIPAL) {
        return true;
      }
      
      // Query backend for all other principals
      const isAdmin = await actor.isAdmin();
      return isAdmin;
    },
    enabled: !!actor && !actorFetching && !!currentPrincipal,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
