export interface CalendarEvent {
  title: string | null;
  type: string | null;
  id: string;
  subId: string | null;
  addressLine1: string | null;
  organiser: string | null;
  start: Date;
  end: Date;
}
