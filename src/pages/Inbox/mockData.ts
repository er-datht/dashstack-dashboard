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
  senderEmail?: string;
  labelId: string;
  subject: string;
  time: string;
  isStarred?: boolean;
};

export const mockEmailRecords: EmailRecord[] = [
  {
    id: "rec-1",
    senderName: "Ethan Rodriguez",
    senderEmail: "ethan.rodriguez@example.com",
    labelId: "primary",
    subject: "Enroll in our Graphic Design Certificate program today!",
    time: "8:38 AM",
    isStarred: true,
  },
  {
    id: "rec-2",
    senderName: "Jullu Jalal",
    senderEmail: "jullu.jalal@example.com",
    labelId: "primary",
    subject: "Our Bachelor of Commerce program is ACBSP-accredited.",
    time: "8:38 AM",
  },
  {
    id: "rec-3",
    senderName: "Sophie Walker",
    senderEmail: "sophie.walker@example.com",
    labelId: "work",
    subject: "Learn about our specialized UX/UI Design workshops.",
    time: "4:30 PM",
    isStarred: true,
  },
  {
    id: "rec-4",
    senderName: "Oliver Patel",
    senderEmail: "oliver.patel@example.com",
    labelId: "friends",
    subject: "Experience our Digital Marketing Strategy course.",
    time: "6:05 PM",
  },
  {
    id: "rec-5",
    senderName: "Ella Carter",
    senderEmail: "ella.carter@example.com",
    labelId: "primary",
    subject: "Explore the exciting realm of Product Development with us.",
    time: "2:55 PM",
    isStarred: true,
  },
  {
    id: "rec-6",
    senderName: "Maya Thompson",
    senderEmail: "maya.thompson@example.com",
    labelId: "social",
    subject:
      "Join us as we delve into the fascinating field of Product Strategy.",
    time: "8:15 AM",
  },
  {
    id: "rec-7",
    senderName: "Liam Johnson",
    senderEmail: "liam.johnson@example.com",
    labelId: "social",
    subject: "Step into the innovative world of Product Leadership with us.",
    time: "5:00 PM",
  },
  {
    id: "rec-8",
    senderName: "Sophia Martinez",
    senderEmail: "sophia.martinez@example.com",
    labelId: "work",
    subject: "Discover the dynamic landscape of Product Innovation with us.",
    time: "9:00 AM",
    isStarred: true,
  },
  {
    id: "rec-9",
    senderName: "Oliver Brown",
    senderEmail: "oliver.brown@example.com",
    labelId: "work",
    subject: "Uncover the secrets of successful Product Management with us.",
    time: "3:45 PM",
  },
  {
    id: "rec-10",
    senderName: "Ava Wilson",
    senderEmail: "ava.wilson@example.com",
    labelId: "social",
    subject: "Venture into the world of Product Design with us.",
    time: "11:30 AM",
  },
  {
    id: "rec-11",
    senderName: "Noah Smith",
    senderEmail: "noah.smith@example.com",
    labelId: "friends",
    subject: "Join us on the exciting path of Product Development.",
    time: "2:00 PM",
  },
  {
    id: "rec-12",
    senderName: "Leo Kim",
    senderEmail: "leo.kim@example.com",
    labelId: "social",
    subject: "Start your adventure with our Mobile App Development program.",
    time: "9:10 PM",
  },
  {
    id: "rec-13",
    senderName: "Victoria Nguyen",
    senderEmail: "victoria.nguyen@example.com",
    labelId: "friends",
    subject: "Dive deep into our Artificial Intelligence specialization.",
    time: "10:50 PM",
  },
];

export const mockSpamRecords: EmailRecord[] = [
  {
    id: "spam-1",
    senderName: "Prize Center",
    senderEmail: "winner@prize-center-intl.com",
    labelId: "primary",
    subject: "Congratulations! You've won $1,000,000 — claim now!",
    time: "8:38 AM",
    isStarred: true,
  },
  {
    id: "spam-2",
    senderName: "Account Security",
    senderEmail: "noreply@secur1ty-alert.net",
    labelId: "work",
    subject: "Urgent: Your account has been compromised. Verify immediately.",
    time: "9:15 AM",
  },
  {
    id: "spam-3",
    senderName: "Dr. Miracle Health",
    senderEmail: "offers@miracle-health.biz",
    labelId: "social",
    subject: "Lose 30 pounds in 30 days — guaranteed or your money back!",
    time: "10:02 AM",
  },
  {
    id: "spam-4",
    senderName: "Royal Treasury UK",
    senderEmail: "funds@royal-treasury-uk.org",
    labelId: "primary",
    subject: "Inheritance of $4.5M awaiting your confirmation.",
    time: "10:47 AM",
  },
  {
    id: "spam-5",
    senderName: "CheapMeds Online",
    senderEmail: "deals@cheapmeds-rx.shop",
    labelId: "social",
    subject: "80% off prescription medications — no prescription needed!",
    time: "11:30 AM",
    isStarred: true,
  },
  {
    id: "spam-6",
    senderName: "Bitcoin Revolution",
    senderEmail: "invest@btc-revolution.io",
    labelId: "work",
    subject: "Make $5,000/day with this one simple crypto trick.",
    time: "12:05 PM",
  },
  {
    id: "spam-7",
    senderName: "Free iPhone Giveaway",
    senderEmail: "claim@iphone-giveaway.promo",
    labelId: "friends",
    subject: "You've been selected for a free iPhone 16 Pro Max!",
    time: "1:22 PM",
  },
  {
    id: "spam-8",
    senderName: "Nigerian Prince",
    senderEmail: "prince.abubakar@diplomail.ng",
    labelId: "primary",
    subject: "I need your help transferring $12M — you keep 30%.",
    time: "2:10 PM",
  },
  {
    id: "spam-9",
    senderName: "Hot Singles Near You",
    senderEmail: "matches@dating-now.xyz",
    labelId: "social",
    subject: "5 new matches are waiting for your reply!",
    time: "2:55 PM",
  },
  {
    id: "spam-10",
    senderName: "Fake Invoice Team",
    senderEmail: "billing@invoice-pay.click",
    labelId: "work",
    subject: "Invoice #INV-29831 overdue — pay now to avoid penalties.",
    time: "3:40 PM",
  },
  {
    id: "spam-11",
    senderName: "Survey Rewards",
    senderEmail: "rewards@easy-survey-cash.com",
    labelId: "friends",
    subject: "Complete a 2-minute survey and earn a $500 gift card!",
    time: "4:18 PM",
  },
  {
    id: "spam-12",
    senderName: "Loan Approved",
    senderEmail: "apply@instant-loan-now.co",
    labelId: "primary",
    subject: "You're pre-approved for a $50,000 loan at 0% interest!",
    time: "5:33 PM",
  },
  {
    id: "spam-13",
    senderName: "Weight Loss Secrets",
    senderEmail: "tips@slim-body-fast.info",
    labelId: "social",
    subject: "Doctors hate this one weird trick for a flat stomach.",
    time: "7:01 PM",
  },
  {
    id: "spam-14",
    senderName: "Luxury Replica Store",
    senderEmail: "sale@luxury-replicas.top",
    labelId: "friends",
    subject: "Designer watches and bags at 95% off — limited time only!",
    time: "8:45 PM",
  },
];
