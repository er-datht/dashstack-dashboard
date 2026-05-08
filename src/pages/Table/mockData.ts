import type {
  GenericRow,
  MockOrder,
  MockProductWithActions,
  MockProductWithColors,
  MockUser,
} from "./types";

// Tiny generic dataset (4 rows) shared by Default / Striped / Bordered /
// Compact variants in the Basic Tables section. Same data + same column
// structure across all four variants — only the modifier prop differs.
export const basicMockRows: GenericRow[] = [
  { id: "b1", label: "Alpha", value: "12" },
  { id: "b2", label: "Beta", value: "8" },
  { id: "b3", label: "Gamma", value: "21" },
  { id: "b4", label: "Delta", value: "5" },
];

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    name: "Natali Craig",
    email: "natali.craig@example.com",
  },
  {
    id: "u2",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    name: "Drew Cano",
    email: "drew.cano@example.com",
  },
  {
    id: "u3",
    avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    name: "Andi Lane",
    email: "andi.lane@example.com",
  },
  {
    id: "u4",
    avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    name: "Koray Okumus",
    email: "koray.okumus@example.com",
  },
  {
    id: "u5",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    name: "Kate Morrison",
    email: "kate.morrison@example.com",
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: "o1",
    orderId: "#10421",
    customer: "Marcus Bergson",
    status: "Delivered",
  },
  {
    id: "o2",
    orderId: "#10422",
    customer: "Sasha Grey",
    status: "Pending",
  },
  {
    id: "o3",
    orderId: "#10423",
    customer: "Lena Park",
    status: "Rejected",
  },
  {
    id: "o4",
    orderId: "#10424",
    customer: "Tomoko Sato",
    status: "Delivered",
  },
  {
    id: "o5",
    orderId: "#10425",
    customer: "Daniel Reeves",
    status: "Pending",
  },
];

export const mockProductsWithColors: MockProductWithColors[] = [
  {
    id: "p1",
    name: "Aria Lounge Chair",
    availableColors: [
      { name: "Charcoal", hex: "#1F2937" },
      { name: "Sand", hex: "#D6C7A1" },
      { name: "Olive", hex: "#5F6B3A" },
    ],
  },
  {
    id: "p2",
    name: "Stratus Desk Lamp",
    availableColors: [
      { name: "Black", hex: "#111111" },
      { name: "Brass", hex: "#B5894F" },
    ],
  },
  {
    id: "p3",
    name: "Nori Side Table",
    availableColors: [
      { name: "Walnut", hex: "#5B3A29" },
      { name: "Ash", hex: "#C9C4BC" },
      { name: "Indigo", hex: "#3A4F8B" },
      { name: "Coral", hex: "#E58A7A" },
      { name: "Moss", hex: "#5C8A52" },
      { name: "Linen", hex: "#EFE9DD" },
    ],
  },
  {
    id: "p4",
    name: "Vela Pendant",
    availableColors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Slate", hex: "#3F4A55" },
      { name: "Saffron", hex: "#E5A93A" },
    ],
  },
  {
    id: "p5",
    name: "Linden Bookshelf",
    availableColors: [
      { name: "Oak", hex: "#A6794B" },
      { name: "Ebony", hex: "#1A1A1A" },
    ],
  },
];

export const mockProductsWithActions: MockProductWithActions[] = [
  { id: "a1", name: "Aria Lounge Chair" },
  { id: "a2", name: "Stratus Desk Lamp" },
  { id: "a3", name: "Nori Side Table" },
  { id: "a4", name: "Vela Pendant" },
  { id: "a5", name: "Linden Bookshelf" },
];

// 25 rows for the Paginated variant (pageSize=5 → 5 pages).
export const paginatedMockRows: GenericRow[] = Array.from(
  { length: 25 },
  (_, i) => ({
    id: `r${i + 1}`,
    label: `Row ${i + 1}`,
    value: String((i + 1) * 7),
  }),
);

// Small dataset for the Clickable Rows variant.
export const clickableMockRows: GenericRow[] = [
  { id: "c1", label: "Sprint 24", value: "active" },
  { id: "c2", label: "Sprint 25", value: "planning" },
  { id: "c3", label: "Sprint 26", value: "draft" },
  { id: "c4", label: "Sprint 27", value: "archived" },
];
