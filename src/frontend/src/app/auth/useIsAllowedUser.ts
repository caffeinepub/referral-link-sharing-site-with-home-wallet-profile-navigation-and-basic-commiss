import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';

export function useIsAllowedUser() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAllowedUser'],
    queryFn: async () => {
      if (!actor) return false;
      const isAllowed = await actor.isCallerApproved();
      return isAllowed;
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
