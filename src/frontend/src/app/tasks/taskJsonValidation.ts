import type { Task } from '../../backend';
import { toast } from 'sonner';

export interface TaskInput {
  title: string;
  description: string;
  reward?: number | string | null;
}

export function validateAndParseTasksJson(jsonInput: string): Task[] | null {
  try {
    // Parse the JSON input
    const parsedTasks = JSON.parse(jsonInput);

    // Validate that it's an array
    if (!Array.isArray(parsedTasks)) {
      toast.error('Input must be a JSON array of tasks');
      return null;
    }

    // Validate each task
    const validatedTasks: Task[] = [];
    for (let i = 0; i < parsedTasks.length; i++) {
      const task = parsedTasks[i];

      if (!task.title || typeof task.title !== 'string' || !task.title.trim()) {
        toast.error(`Task ${i + 1}: Title is required and must be a non-empty string`);
        return null;
      }

      if (!task.description || typeof task.description !== 'string' || !task.description.trim()) {
        toast.error(`Task ${i + 1}: Description is required and must be a non-empty string`);
        return null;
      }

      // Validate reward if provided
      let rewardValue: bigint | undefined = undefined;
      if (task.reward !== undefined && task.reward !== null) {
        if (typeof task.reward === 'number') {
          if (task.reward < 0 || !Number.isInteger(task.reward)) {
            toast.error(`Task ${i + 1}: Reward must be a non-negative integer`);
            return null;
          }
          rewardValue = BigInt(task.reward);
        } else if (typeof task.reward === 'string') {
          try {
            rewardValue = BigInt(task.reward);
            if (rewardValue < 0n) {
              toast.error(`Task ${i + 1}: Reward must be non-negative`);
              return null;
            }
          } catch {
            toast.error(`Task ${i + 1}: Invalid reward value`);
            return null;
          }
        } else {
          toast.error(`Task ${i + 1}: Reward must be a number`);
          return null;
        }
      }

      validatedTasks.push({
        title: task.title.trim(),
        description: task.description.trim(),
        reward: rewardValue,
      });
    }

    if (validatedTasks.length === 0) {
      toast.error('No valid tasks to upload');
      return null;
    }

    return validatedTasks;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      toast.error('Invalid JSON format. Please check your input.');
    } else {
      toast.error(error.message || 'Failed to parse tasks');
    }
    return null;
  }
}
