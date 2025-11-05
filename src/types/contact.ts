/**
 * Contact Type Definitions
 * Types related to Contact screen
 */

import type { ID } from "./common";

export type Contact = {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  address?: ContactAddress;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactAddress = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export type ContactGroup = {
  id: ID;
  name: string;
  description?: string;
  contactIds: ID[];
  createdAt: string;
};

export type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  notes?: string;
};
