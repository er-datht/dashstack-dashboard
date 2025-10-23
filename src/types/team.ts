/**
 * Team Type Definitions
 * Types related to Team screen
 */

import type { ID, UserRole } from "./common";

export type TeamMember = {
  id: ID;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: string;
  position: string;
  phone?: string;
  status: TeamMemberStatus;
  joinedDate: string;
};

export type TeamMemberStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "terminated";

export type Department = {
  id: ID;
  name: string;
  description?: string;
  managerId?: ID;
  memberCount: number;
};

export type TeamInvitation = {
  email: string;
  role: UserRole;
  department: string;
  position: string;
};
