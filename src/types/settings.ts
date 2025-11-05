/**
 * Settings Type Definitions
 * Types related to Settings screen
 */

import type { Theme } from "./common";

export type AppSettings = {
  theme: Theme;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
};

export type NotificationSettings = {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
};

export type PrivacySettings = {
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
};

export type DisplaySettings = {
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showSidebar: boolean;
  dateFormat: string;
  timeFormat: "12h" | "24h";
};
