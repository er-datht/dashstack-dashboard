import type { ID } from "./common";

/**
 * Todo Type Definitions
 * Types related to Todo functionality
 */

/**
 * Internal TodoItem type used throughout the application
 */
export type TodoItem = {
  id: ID;
  text: string;
  completed: boolean;
  starred: boolean;
  createdAt: string;
};

/**
 * API Todo type from the backend
 * This represents the structure returned by the external API
 */
export type ApiTodo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

/**
 * Todo filter options
 */
export type TodoFilter = "all" | "active" | "completed" | "starred";
