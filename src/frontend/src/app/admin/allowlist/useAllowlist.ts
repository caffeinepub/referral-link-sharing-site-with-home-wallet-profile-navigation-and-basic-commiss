import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { Principal } from '@dfinity/principal';
import type { UserApprovalInfo } from '../../../backend';
import { ApprovalStatus } from '../../../backend';

export function useListAllowedUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserApprovalInfo[]>({
    queryKey: ['allowlist'],
    queryFn: async () => {
      if (!actor) return [];
      const approvals = await actor.listApprovals();
      return approvals.filter(approval => approval.status === ApprovalStatus.approved);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useAddAllowedUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalString: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalString);
      await actor.setApproval(principal, ApprovalStatus.approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowlist'] });
    },
  });
}

export function useRemoveAllowedUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalString: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalString);
      await actor.setApproval(principal, ApprovalStatus.rejected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowlist'] });
    },
  });
}
