import type { CalendarEvent } from "../types/calendar";

// Tiny 1x1 pixel placeholder images encoded as base64 data URLs for testing
const SAMPLE_IMAGE_PURPLE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzdlNTdlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkRlc2lnbiBDb25mPC90ZXh0Pjwvc3ZnPg==";

const SAMPLE_IMAGE_PINK =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2U5NTFiZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkZlc3RpdmFsPC90ZXh0Pjwvc3ZnPg==";

export const calendarEvents: CalendarEvent[] = [
  // ── All-day events ──────────────────────────────────────────────────
  {
    id: "evt-1",
    title: "Design Conference",
    startDate: new Date(2025, 0, 6),
    allDay: true,
    location: "56 Davion Misson Suite 157",
    organizer: "Meaghan Berg",
    image: SAMPLE_IMAGE_PURPLE,
    color: {
      border: "#7551e9",
      bg: "rgba(117, 81, 233, 0.15)",
      text: "#7551e9",
    },
    participants: [
      { id: "p1", name: "Alice Johnson" },
      { id: "p2", name: "Bob Smith" },
      { id: "p3", name: "Charlie Lee" },
      { id: "p4", name: "Diana Ross" },
    ],
  },
  {
    id: "evt-2",
    title: "Weekend Festival",
    startDate: new Date(2024, 9, 16),
    allDay: true,
    location: "853 Moore Flats Suite 158",
    organizer: "Sweden",
    image: SAMPLE_IMAGE_PINK,
    color: {
      border: "#e951bf",
      bg: "rgba(233, 81, 191, 0.15)",
      text: "#e951bf",
    },
    participants: [
      { id: "p5", name: "Eve Martinez" },
      { id: "p6", name: "Frank Wilson" },
      { id: "p7", name: "Grace Kim" },
      { id: "p8", name: "Hank Davis" },
    ],
  },
  {
    id: "evt-3",
    title: "Glastonbury Festival",
    startDate: new Date(2024, 11, 20),
    endDate: new Date(2024, 11, 22),
    allDay: true,
    location: "646 Walter Road Apt. 571",
    organizer: "Turks and Caicos Islands",
    color: {
      border: "#ff9e58",
      bg: "rgba(255, 158, 88, 0.15)",
      text: "#ff9e58",
    },
    participants: [
      { id: "p9", name: "Ivy Chen" },
      { id: "p10", name: "Jack Brown" },
    ],
  },
  {
    id: "evt-4",
    title: "Ultra Europe 2025",
    startDate: new Date(2025, 0, 10),
    allDay: true,
    location: "506 Satterfield Tunnel Apt. 963",
    organizer: "San Marino",
    color: {
      border: "#516fe9",
      bg: "rgba(81, 111, 233, 0.15)",
      text: "#516fe9",
    },
    participants: [
      { id: "p11", name: "Karen White" },
      { id: "p12", name: "Leo Taylor" },
      { id: "p13", name: "Mia Anderson" },
      { id: "p14", name: "Noah Thomas" },
    ],
  },
  // ── All-day event in April 2026 ────────────────────────────────────
  {
    id: "evt-5",
    title: "Spring Company Retreat",
    startDate: new Date(2026, 3, 14),
    endDate: new Date(2026, 3, 16),
    allDay: true,
    location: "Mountain Lodge Resort",
    organizer: "HR Department",
    color: {
      border: "#34d399",
      bg: "rgba(52, 211, 153, 0.15)",
      text: "#34d399",
    },
    participants: [
      { id: "p15", name: "Sarah Park" },
      { id: "p16", name: "David Kim" },
    ],
  },
  // ── Timed events in April 2026 ─────────────────────────────────────
  {
    id: "evt-6",
    title: "Team Standup",
    startDate: new Date(2026, 3, 15, 9, 0),
    endDate: new Date(2026, 3, 15, 9, 30),
    allDay: false,
    location: "Conference Room A",
    organizer: "James Rivera",
    color: {
      border: "#516fe9",
      bg: "rgba(81, 111, 233, 0.15)",
      text: "#516fe9",
    },
    participants: [
      { id: "p17", name: "Liam Chen" },
      { id: "p18", name: "Olivia Wu" },
    ],
  },
  {
    id: "evt-7",
    title: "Product Review",
    startDate: new Date(2026, 3, 15, 10, 0),
    endDate: new Date(2026, 3, 15, 11, 30),
    allDay: false,
    location: "Board Room",
    organizer: "Emma Watson",
    color: {
      border: "#7551e9",
      bg: "rgba(117, 81, 233, 0.15)",
      text: "#7551e9",
    },
    participants: [
      { id: "p19", name: "Marcus Hall" },
      { id: "p20", name: "Sophie Chen" },
      { id: "p21", name: "Ryan Park" },
    ],
  },
  {
    id: "evt-8",
    title: "Lunch with Client",
    startDate: new Date(2026, 3, 16, 12, 0),
    endDate: new Date(2026, 3, 16, 13, 30),
    allDay: false,
    location: "Downtown Bistro",
    organizer: "Alex Morgan",
    color: {
      border: "#e951bf",
      bg: "rgba(233, 81, 191, 0.15)",
      text: "#e951bf",
    },
    participants: [
      { id: "p22", name: "Nina Foster" },
    ],
  },
  {
    id: "evt-9",
    title: "Design Workshop",
    startDate: new Date(2026, 3, 17, 14, 0),
    endDate: new Date(2026, 3, 17, 16, 0),
    allDay: false,
    location: "Creative Lab",
    organizer: "Lisa Park",
    color: {
      border: "#ff9e58",
      bg: "rgba(255, 158, 88, 0.15)",
      text: "#ff9e58",
    },
    participants: [
      { id: "p23", name: "Tom Baker" },
      { id: "p24", name: "Amy Liu" },
    ],
  },
  {
    id: "evt-10",
    title: "Sprint Planning",
    startDate: new Date(2026, 3, 15, 10, 30),
    endDate: new Date(2026, 3, 15, 12, 0),
    allDay: false,
    location: "Meeting Room B",
    organizer: "Carlos Diaz",
    color: {
      border: "#f43f5e",
      bg: "rgba(244, 63, 94, 0.15)",
      text: "#f43f5e",
    },
    participants: [
      { id: "p25", name: "Yuki Tanaka" },
    ],
  },
];
