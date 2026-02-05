import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { ReferralLink } from '../../backend';

export function useReferralLinks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ReferralLink[]>({
    queryKey: ['referralLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReferralLinks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateReferralLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      destinationUrl,
      commission,
    }: {
      title: string;
      destinationUrl: string;
      commission: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createReferralLink(title, destinationUrl, commission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralLinks'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
