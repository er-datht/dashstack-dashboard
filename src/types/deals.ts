/**
 * Deal Type Definitions
 * Type definitions for deal-related data structures
 */

import type { StatusType } from '../components/StatusBadge';

/**
 * Album response from JSONPlaceholder API
 * Used as a placeholder API since there's no real deals API available
 */
export type AlbumResponse = {
  userId: number;
  id: number;
  title: string;
};

/**
 * Deal object representing a product deal/transaction
 * Internal format used throughout the application
 */
export type Deal = {
  id: number;
  name: string;
  location: string;
  datetime: string;
  amount: number;
  price: string;
  status: StatusType;
  image: string;
};
