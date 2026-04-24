import {
  Mail,
  Star,
  Send,
  PenLine,
  AlertTriangle,
  MessageSquare,
  Trash2,
  Archive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Message } from "../../types/inbox";

export type InboxFolder = {
  id: string;
  nameKey: string;
  icon: LucideIcon;
  count: number;
};

export type InboxLabel = {
  id: string;
  nameKey: string;
  color: string;
};

export const inboxFolders: InboxFolder[] = [
  { id: "inbox", nameKey: "folders.inbox", icon: Mail, count: 1253 },
  { id: "starred", nameKey: "folders.starred", icon: Star, count: 245 },
  { id: "sent", nameKey: "folders.sent", icon: Send, count: 24532 },
  { id: "draft", nameKey: "folders.draft", icon: PenLine, count: 9 },
  { id: "spam", nameKey: "folders.spam", icon: AlertTriangle, count: 14 },
  {
    id: "important",
    nameKey: "folders.important",
    icon: MessageSquare,
    count: 18,
  },
  { id: "bin", nameKey: "folders.bin", icon: Trash2, count: 9 },
  { id: "archive", nameKey: "folders.archive", icon: Archive, count: 0 },
];

export const inboxLabels: InboxLabel[] = [
  { id: "primary", nameKey: "labels.primary", color: "#00b69b" },
  { id: "social", nameKey: "labels.social", color: "#5a8cff" },
  { id: "work", nameKey: "labels.work", color: "#fd9a56" },
  { id: "friends", nameKey: "labels.friends", color: "#d456fd" },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-2",
    senderName: "Ethan Rodriguez",
    recipientId: "user-1",
    subject: "Project Update",
    body: "Hi there! I wanted to check in and see how things are going with the project. Do you have any updates or need any help?",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    createdAt: "2025-01-15T18:30:00Z",
    folder: "inbox",
  },
  {
    id: "msg-2",
    senderId: "user-1",
    senderName: "You",
    recipientId: "user-2",
    subject: "Re: Project Update",
    body: "Hey! Thanks for reaching out. Everything is going well on my end. I have been working on the new feature and it should be ready for review by the end of the week.",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    createdAt: "2025-01-15T18:35:00Z",
    folder: "sent",
  },
  {
    id: "msg-3",
    senderId: "user-2",
    senderName: "Ethan Rodriguez",
    recipientId: "user-1",
    subject: "Re: Project Update",
    body: "That sounds great! Let me know if you need anything from my side. I will be available all week for any questions or support.",
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    createdAt: "2025-01-15T18:40:00Z",
    folder: "inbox",
  },
];

export type EmailRecord = {
  id: string;
  senderName: string;
  labelId: string;
  subject: string;
  time: string;
  isStarred?: boolean;
};

export const mockEmailRecords: EmailRecord[] = [
  {
    id: "rec-1",
    senderName: "Ethan Rodriguez",
    labelId: "primary",
    subject: "Enroll in our Graphic Design Certificate program today!",
    time: "8:38 AM",
    isStarred: true,
  },
  {
    id: "rec-2",
    senderName: "Jullu Jalal",
    labelId: "primary",
    subject: "Our Bachelor of Commerce program is ACBSP-accredited.",
    time: "8:38 AM",
  },
  {
    id: "rec-3",
    senderName: "Sophie Walker",
    labelId: "work",
    subject: "Learn about our specialized UX/UI Design workshops.",
    time: "4:30 PM",
    isStarred: true,
  },
  {
    id: "rec-4",
    senderName: "Oliver Patel",
    labelId: "friends",
    subject: "Experience our Digital Marketing Strategy course.",
    time: "6:05 PM",
  },
  {
    id: "rec-5",
    senderName: "Ella Carter",
    labelId: "primary",
    subject: "Explore the exciting realm of Product Development with us.",
    time: "2:55 PM",
    isStarred: true,
  },
  {
    id: "rec-6",
    senderName: "Maya Thompson",
    labelId: "social",
    subject:
      "Join us as we delve into the fascinating field of Product Strategy.",
    time: "8:15 AM",
  },
  {
    id: "rec-7",
    senderName: "Liam Johnson",
    labelId: "social",
    subject: "Step into the innovative world of Product Leadership with us.",
    time: "5:00 PM",
  },
  {
    id: "rec-8",
    senderName: "Sophia Martinez",
    labelId: "work",
    subject: "Discover the dynamic landscape of Product Innovation with us.",
    time: "9:00 AM",
    isStarred: true,
  },
  {
    id: "rec-9",
    senderName: "Oliver Brown",
    labelId: "work",
    subject: "Uncover the secrets of successful Product Management with us.",
    time: "3:45 PM",
  },
  {
    id: "rec-10",
    senderName: "Ava Wilson",
    labelId: "social",
    subject: "Venture into the world of Product Design with us.",
    time: "11:30 AM",
  },
  {
    id: "rec-11",
    senderName: "Noah Smith",
    labelId: "friends",
    subject: "Join us on the exciting path of Product Development.",
    time: "2:00 PM",
  },
  {
    id: "rec-12",
    senderName: "Leo Kim",
    labelId: "social",
    subject: "Start your adventure with our Mobile App Development program.",
    time: "9:10 PM",
  },
  {
    id: "rec-13",
    senderName: "Victoria Nguyen",
    labelId: "friends",
    subject: "Dive deep into our Artificial Intelligence specialization.",
    time: "10:50 PM",
  },
];
