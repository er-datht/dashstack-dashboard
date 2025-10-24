import {
  LayoutDashboard,
  Package,
  Heart,
  Inbox,
  ClipboardList,
  Archive,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  FileText,
  Layers,
  UsersRound,
  Table,
  Settings,
  LogOut,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "../../routes/routes";
import type { TFunction } from "i18next";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  route?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const getNavSections = (t: TFunction): NavSection[] => [
  {
    title: t("navigation:dashboard").toUpperCase(),
    items: [
      {
        id: "dashboard",
        label: t("navigation:dashboard"),
        icon: LayoutDashboard,
        route: ROUTES.DASHBOARD,
      },
      {
        id: "products",
        label: t("navigation:products"),
        icon: Package,
        route: ROUTES.PRODUCTS,
      },
      {
        id: "favorites",
        label: t("products:favorites", "Favorites"),
        icon: Heart,
        route: ROUTES.FAVORITES,
      },
      {
        id: "inbox",
        label: t("navigation:inbox", "Inbox"),
        icon: Inbox,
        route: ROUTES.INBOX,
      },
      {
        id: "order-lists",
        label: t("orders:orderList"),
        icon: ClipboardList,
        route: ROUTES.ORDERS,
      },
      {
        id: "product-stock",
        label: t("products:stock"),
        icon: Archive,
        route: ROUTES.PRODUCT_STOCK,
      },
    ],
  },
  {
    title: t("navigation:pages", "PAGES").toUpperCase(),
    items: [
      {
        id: "pricing",
        label: t("navigation:pricing", "Pricing"),
        icon: DollarSign,
        route: ROUTES.PRICING,
      },
      {
        id: "calendar",
        label: t("navigation:calendar", "Calendar"),
        icon: Calendar,
        route: ROUTES.CALENDAR,
      },
      {
        id: "to-do",
        label: t("navigation:todo", "To-Do"),
        icon: CheckSquare,
        route: ROUTES.TODO,
      },
      {
        id: "contact",
        label: t("navigation:contact", "Contact"),
        icon: Users,
        route: ROUTES.CONTACT,
      },
      {
        id: "invoice",
        label: t("orders:viewInvoice"),
        icon: FileText,
        route: ROUTES.INVOICE,
      },
      {
        id: "ui-element",
        label: t("navigation:uiElement", "UI Element"),
        icon: Layers,
        route: ROUTES.UI_ELEMENT,
      },
      {
        id: "team",
        label: t("navigation:team", "Team"),
        icon: UsersRound,
        route: ROUTES.TEAM,
      },
      {
        id: "table",
        label: t("navigation:table", "Table"),
        icon: Table,
        route: ROUTES.TABLE,
      },
    ],
  },
];

export const getBottomItems = (t: TFunction): NavItem[] => [
  {
    id: "settings",
    label: t("navigation:settings"),
    icon: Settings,
    route: ROUTES.SETTINGS,
  },
  {
    id: "theme",
    label: t("settings:theme", "Theme"),
    icon: Moon, // Default icon, will be dynamically rendered in BottomSection
  },
  {
    id: "logout",
    label: t("navigation:logout"),
    icon: LogOut,
    route: ROUTES.LOGIN,
  },
];
