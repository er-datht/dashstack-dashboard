/**
 * useTodos Hook
 * Custom hook for managing todos with React Query
 * Provides optimistic updates, caching, and automatic refetching
 */

import { useQuery, useMutation, useQueryClient } from "./useReactQuery";
import {
  fetchTodos,
  createTodo,
  updateTodo as updateTodoService,
  deleteTodo as deleteTodoService,
  transformApiTodo,
} from "../services/todos";
import type { TodoItem } from "../types/todo";

/**
 * Query key for todos - used for caching and invalidation
 */
const TODOS_QUERY_KEY = ["todos"] as const;

type UseTodosReturn = {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  addTodo: (todo: Omit<TodoItem, "id">) => Promise<TodoItem>;
  updateTodo: (
    id: string | number,
    updates: Partial<TodoItem>
  ) => Promise<TodoItem>;
  deleteTodo: (id: string | number) => Promise<void>;
  refetch: () => Promise<unknown>;
  isAddingTodo: boolean;
  isUpdatingTodo: boolean;
  isDeletingTodo: boolean;
};

/**
 * Custom hook for managing todos with React Query
 * Handles fetching, creating, updating, and deleting todos with optimistic updates
 */
export const useTodos = (): UseTodosReturn => {
  const queryClient = useQueryClient();

  /**
   * Fetch todos query
   */
  const {
    data: todos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: fetchTodos,
  });

  /**
   * Add todo mutation with optimistic update
   */
  const addTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (newTodo) => {
      // Optimistically update the cache
      queryClient.setQueryData<TodoItem[]>(TODOS_QUERY_KEY, (old = []) => [
        newTodo,
        ...old,
      ]);
    },
    onError: (error) => {
      console.error("Error adding todo:", error);
      // Optionally invalidate queries to refetch from server
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
    },
  });

  /**
   * Update todo mutation with optimistic update
   */
  const updateTodoMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string | number;
      updates: Partial<TodoItem>;
    }) => {
      // Get current todo to preserve starred state
      const currentTodo = todos.find((t) => t.id === id);

      // Call the service to update the todo
      const response = await updateTodoService(id, updates);

      // Merge API response with local-only fields (starred)
      return {
        ...transformApiTodo(response),
        starred:
          updates.starred !== undefined
            ? updates.starred
            : currentTodo?.starred || false,
      };
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

      // Snapshot the previous value
      const previousTodos =
        queryClient.getQueryData<TodoItem[]>(TODOS_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData<TodoItem[]>(TODOS_QUERY_KEY, (old = []) =>
        old.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
      );

      // Return context with the snapshot
      return { previousTodos };
    },
    onSuccess: (updatedTodo) => {
      // Update with server response
      queryClient.setQueryData<TodoItem[]>(TODOS_QUERY_KEY, (old = []) =>
        old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    },
    onError: (error, _variables, context) => {
      console.error("Error updating todo:", error);
      // Rollback to previous state on error
      if (context?.previousTodos) {
        queryClient.setQueryData<TodoItem[]>(
          TODOS_QUERY_KEY,
          context.previousTodos
        );
      }
    },
  });

  /**
   * Delete todo mutation with optimistic update
   */
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await deleteTodoService(id);
      return id;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

      // Snapshot the previous value
      const previousTodos =
        queryClient.getQueryData<TodoItem[]>(TODOS_QUERY_KEY);

      // Optimistically remove from cache
      queryClient.setQueryData<TodoItem[]>(TODOS_QUERY_KEY, (old = []) =>
        old.filter((todo) => todo.id !== id)
      );

      // Return context with the snapshot
      return { previousTodos };
    },
    onError: (error, _variables, context) => {
      console.error("Error deleting todo:", error);
      // Rollback to previous state on error
      if (context?.previousTodos) {
        queryClient.setQueryData<TodoItem[]>(
          TODOS_QUERY_KEY,
          context.previousTodos
        );
      }
    },
  });

  /**
   * Return the hook API
   */
  return {
    todos,
    isLoading,
    error: error ? (error as Error).message : null,
    addTodo: (todo: Omit<TodoItem, "id">) => addTodoMutation.mutateAsync(todo),
    updateTodo: (id: string | number, updates: Partial<TodoItem>) =>
      updateTodoMutation.mutateAsync({ id, updates }),
    deleteTodo: async (id: string | number) => {
      await deleteTodoMutation.mutateAsync(id);
    },
    refetch,
    isAddingTodo: addTodoMutation.isPending,
    isUpdatingTodo: updateTodoMutation.isPending,
    isDeletingTodo: deleteTodoMutation.isPending,
  };
};
