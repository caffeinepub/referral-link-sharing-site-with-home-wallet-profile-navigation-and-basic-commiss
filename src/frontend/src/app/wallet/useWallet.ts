import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useAuth } from '../auth/useAuth';
import { getWalletEvents, addWalletEvent, WalletEvent } from './walletEventsStore';
import { PayoutRequest } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';

export function useWallet() {
  const { principalString } = useAuth();
  const { balance, isLoadingBalance } = useBalance();
  const events = getWalletEvents(principalString);

  return {
    balance: Number(balance),
    isLoadingBalance,
    transactions: events,
  };
}

export function useBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<bigint>({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    balance: query.data || BigInt(0),
    isLoadingBalance: query.isLoading,
  };
}

export function useRequestPayout() {
  const { actor } = useActor();
  const { principalString } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.requestPayout(amount);
      
      // Record the payout request locally
      addWalletEvent(principalString, {
        type: 'payout',
        amount: Number(amount),
        timestamp: Date.now(),
        status: 'Pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['myPayoutRequests'] });
    },
  });
}

export function useMyPayoutRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<PayoutRequest[]>({
    queryKey: ['myPayoutRequests'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getMyPayoutRequests();
      return result || [];
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    data: query.data || [],
  };
}

export function useAllPayoutRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Array<[Principal, PayoutRequest[]]>>({
    queryKey: ['allPayoutRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayoutRequests();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    data: query.data || [],
  };
}

export function useApprovePayoutRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, requestId }: { user: Principal; requestId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approvePayoutRequest(user, requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayoutRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myPayoutRequests'] });
    },
  });
}

export function useRejectPayoutRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, requestId }: { user: Principal; requestId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectPayoutRequest(user, requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayoutRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myPayoutRequests'] });
    },
  });
}
