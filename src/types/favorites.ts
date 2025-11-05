/**
 * Favorites Type Definitions
 * Types related to Favorites screen
 */

import type { ID } from "./common";

export type FavoriteItem = {
  id: ID;
  userId: ID;
  itemId: ID;
  itemType: FavoriteItemType;
  itemName: string;
  itemDescription?: string;
  itemImage?: string;
  addedAt: string;
};

export type FavoriteItemType =
  | "product"
  | "page"
  | "contact"
  | "document"
  | "other";

export type FavoriteCategory = {
  id: ID;
  name: string;
  itemCount: number;
};
