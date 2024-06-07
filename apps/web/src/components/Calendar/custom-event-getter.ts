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
      break;
    }
    case 'conference': {
      return {
        style: {
          backgroundColor: '#AD3F00',
          color: '#FFD1B7',
        },
      };
      break;
    }
    case 'exam': {
      return {
        style: {
          backgroundColor: '#FCE5E5',
          color: '#E00000',
        },
      };
      break;
    }
    case 'meetups': {
      return {
        style: {
          backgroundColor: '#EDF7F2',
          color: '#45A172',
        },
      };
      break;
    }
    case 'course': {
      return {
        style: {
          backgroundColor: '#FFEEE5',
          color: '#FF5C00',
        },
      };
      break;
    }
    default: {
      return {
        style: {},
      };
      break;
    }
  }
};
