import type { CalendarEvent } from './calendar-event.ts';

export const customEventGetter = (event: CalendarEvent) => {
  switch (event.type) {
    case 'lecture': {
      return {
        style: {
          backgroundColor: '#FFF0D9',
          color: '#FF9401',
        },
      };
    }
    case 'conference': {
      return {
        style: {
          backgroundColor: '#8530001a',
          color: '#AD3F00',
        },
      };
    }
    case 'exam': {
      return {
        style: {
          backgroundColor: '#FFDAD3',
          color: '#FF0000',
        },
      };
    }
    case 'meetups': {
      return {
        style: {
          backgroundColor: '#EDF7F2',
          color: '#45A172',
        },
      };
    }
    case 'course': {
      return {
        style: {
          backgroundColor: '#FFEEE5',
          color: '#FF5C00',
        },
      };
    }
    default: {
      return {
        style: {},
      };
    }
  }
};
