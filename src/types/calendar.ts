export type EventColor = {
  border: string;
  bg: string;
  text: string;
};

export type Participant = {
  id: string;
  name: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  organizer: string;
  image?: string;
  color: EventColor;
  participants: Participant[];
};
