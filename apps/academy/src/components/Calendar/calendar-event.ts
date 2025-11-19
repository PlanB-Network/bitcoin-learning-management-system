export interface CalendarEvent {
  title: string | null;
  type: string | null;
  id: string;
  subId: string | null;
  addressLine1: string | null;
  organizer: string | null;
  start: Date;
  end: Date;
  isOnline: boolean;
}
