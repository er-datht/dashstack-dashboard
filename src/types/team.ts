/**
 * Team Type Definitions
 * Types related to Team screen
 */

import type { ID } from "./common";

export type TeamMember = {
  id: ID;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};
