import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { Task } from '../../backend';

export function useAvailableTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Task[]>({
    queryKey: ['availableTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableTasks();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      reward,
    }: {
      title: string;
      description: string;
      reward: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTask(title, description, reward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTasks'] });
    },
  });
}

export function useBulkAddTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasks: Task[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkAddTasks(tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTasks'] });
    },
  });
}
