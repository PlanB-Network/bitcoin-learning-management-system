import { cn } from '@blms/ui';
import type { Messages, ToolbarProps, View } from 'react-big-calendar';
import { getDateString } from '#src/utils/date.ts';
import type { CalendarEvent } from './calendar-event.ts';

const formatAgendaLabel = (label: string): string => {
  try {
    const [startDateStr, endDateStr] = label.split(' – ');

    if (!startDateStr || !endDateStr) {
      return label;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    return getDateString(startDate, endDate);
  } catch (error) {
    console.error('Error formatting agenda label:', error);
    return label;
  }
};

interface ViewNamesGroupProps {
  views: any;
  messages: Messages<CalendarEvent>;
  view: View;
  onView: (view: View) => void;
}

function ViewNamesGroup({
  views,
  view,
  messages,
  onView,
}: ViewNamesGroupProps) {
  return views.map((name: View) => {
    return (
      <button
        className={cn(
          name === 'week'
            ? '!hidden md:!inline'
            : name === 'month'
              ? '!rounded-l-sm md:!rounded-none'
              : '',
          name === view && '!bg-newGray-5',
        )}
        type="button"
        key={name}
        // className={clsx({ 'rbc-active': view === name })}
        onClick={() => onView(name)}
      >
        {messages[name]}
      </button>
    );
  });
}

export default function CustomToolbar({
  label,
  localizer: { messages },
  onNavigate,
  onView,
  view,
  views,
}: ToolbarProps<CalendarEvent, object>) {
  const displayLabel = view === 'agenda' ? formatAgendaLabel(label) : label;

  return (
    <div className="rbc-toolbar max-md:px-1">
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-2">
        {/* Navigation Buttons */}
        <span className="rbc-btn-group examples--custom-toolbar">
          <button
            type="button"
            onClick={() => onNavigate('PREV')}
            aria-label={messages.previous!.toString()}
          >
            &#60; {/* Left Arrow */}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('TODAY')}
            aria-label={messages.today!.toString()}
          >
            {displayLabel}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('NEXT')}
            aria-label={messages.next!.toString()}
          >
            &#62; {/* Right Arrow */}
          </button>
        </span>

        <span className="rbc-toolbar-label">{displayLabel}</span>

        {/* View Switcher Buttons */}
        <span className="rbc-btn-group">
          <ViewNamesGroup
            view={view}
            views={views}
            messages={messages}
            onView={onView}
          />
        </span>
      </div>
    </div>
  );
}
