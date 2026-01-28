import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@blms/ui';
import type { EventProps } from 'react-big-calendar';
import type { CalendarEvent } from './calendar-event.js';
import { CustomEventWeek } from './custom-event-week.tsx';

type CustomEventProps = EventProps<CalendarEvent>;

export const CustomAllDayEventWeek = (props: CustomEventProps) => {
  const { event } = props;

  let tooltipBgClass: string;
  let tooltipTextClass: string;

  switch (event.type) {
    case 'class': {
      tooltipBgClass = 'bg-orange-50';
      tooltipTextClass = 'text-orange-500';
      break;
    }
    case 'history': {
      tooltipBgClass = 'bg-brown-200';
      tooltipTextClass = 'text-brown-800';
      break;
    }
    case 'event': {
      tooltipBgClass = 'bg-blue-500';
      tooltipTextClass = 'text-white';
      break;
    }
    default: {
      tooltipBgClass = 'bg-orange-100';
      tooltipTextClass = 'text-orange-700';
      break;
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="w-full h-full">
            <CustomEventWeek {...props} truncateTitle />
          </div>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={5}
          side="bottom"
          className={cn(
            'flex flex-col items-center shadow-none text-xs w-fit px-3 text-start rounded-full border-0',
            tooltipBgClass,
            tooltipTextClass,
          )}
        >
          <span className="body-base">{event.title}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
