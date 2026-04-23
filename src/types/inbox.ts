/**
 * Inbox Type Definitions
 * Types related to Inbox/Messages screen
 */

import type { ID } from "./common";

export type Message = {
  id: ID;
  senderId: ID;
  senderName: string;
  senderAvatar?: string;
  recipientId: ID;
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: MessageAttachment[];
  createdAt: string;
  folder: MessageFolder;
};

export type MessageAttachment = {
  id: ID;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type MessageFolder =
  | "inbox"
  | "sent"
  | "draft"
  | "trash"
  | "spam"
  | "archive";

export type DraftMessage = {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  savedAt: string;
};

export type SentMessage = {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
};

export type MessageFilter = {
  folder: MessageFolder;
  isRead?: boolean;
  isStarred?: boolean;
  searchQuery?: string;
};
