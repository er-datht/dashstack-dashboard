/**
 * UI Element Type Definitions
 * Types related to UI Elements and components
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";

export type AlertType = "info" | "success" | "warning" | "error";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastNotification = {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
  position?: ToastPosition;
};

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
