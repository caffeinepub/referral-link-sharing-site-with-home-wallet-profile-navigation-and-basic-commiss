import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';

const ADMIN_PRINCIPAL = 'lv4e6-aruzu-to76z-gr2e6-edqal-fz764-2qtjs-57xeh-4ik7q-jkiek-zae';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      const isAdmin = await actor.isAdmin();
      return isAdmin;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
