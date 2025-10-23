/**
 * Todo Service Layer
 * API service functions for managing todos
 * Handles API format conversion and data transformation
 */

import { apiService } from "./api";
import type { ApiTodo, TodoItem } from "../types/todo";

/**
 * Transform API todo to internal TodoItem format
 * Converts API field names to internal format and adds default values
 *
 * @param apiTodo - Todo object from the API
 * @returns Transformed TodoItem for internal use
 */
export const transformApiTodo = (apiTodo: ApiTodo): TodoItem => ({
  id: apiTodo.id,
  text: apiTodo.title,
  completed: apiTodo.completed,
  starred: false, // Default value as API doesn't provide this
  createdAt: new Date().toISOString(), // Default to current time as API doesn't provide this
});

/**
 * Fetch all todos from the API
 */
export const fetchTodos = () =>
  apiService.get<ApiTodo[]>("/todos").then((data) => data.map(transformApiTodo));

/**
 * Create a new todo
 */
export const createTodo = (todo: Omit<TodoItem, "id">) =>
  apiService
    .post<ApiTodo>("/todos", {
      title: todo.text,
      completed: todo.completed,
      userId: 1,
    })
    .then(transformApiTodo);

/**
 * Update an existing todo
 */
export const updateTodo = (id: string | number, updates: Partial<TodoItem>) => {
  const apiUpdates: Partial<ApiTodo> = {};
  if (updates.text !== undefined) apiUpdates.title = updates.text;
  if (updates.completed !== undefined) apiUpdates.completed = updates.completed;

  return apiService.patch<ApiTodo>(`/todos/${id}`, apiUpdates);
};

/**
 * Delete a todo
 */
export const deleteTodo = (id: string | number) =>
  apiService.delete(`/todos/${id}`);
