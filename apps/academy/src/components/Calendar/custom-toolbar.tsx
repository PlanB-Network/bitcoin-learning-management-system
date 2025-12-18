import { cn } from '@blms/ui';
import { startOfWeek } from 'date-fns';
import type { Messages, ToolbarProps, View } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
import { formatDateRange } from '#src/utils/date.ts';
import type { CalendarEvent } from './calendar-event.ts';

const formatAgendaLabel = (label: string, locale: string): string => {
  try {
    const [startDateStr, endDateStr] = label.split(' – ');

    if (!startDateStr || !endDateStr) {
      return label;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    return formatDateRange(startDate, endDate, undefined, locale);
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
          'flex items-center justify-center !h-10 px-4 whitespace-nowrap',
          name === 'week'
            ? '!hidden md:!inline-flex'
            : name === 'month'
              ? '!rounded-l-sm md:!rounded-none'
              : '',
          name === view && '!bg-neutral-100',
        )}
        type="button"
        key={name}
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
  date,
}: ToolbarProps<CalendarEvent, object>) {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en-US';

  let displayLabel = label;
  if (view === 'agenda') {
    displayLabel = formatAgendaLabel(label, locale);
  } else if (view === 'month') {
    displayLabel = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } else if (view === 'week') {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    displayLabel = formatDateRange(weekStart, weekEnd, undefined, locale);
  }

  return (
    <div className="rbc-toolbar max-md:px-1">
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-2">
        {/* Navigation Buttons */}
        <span className="rbc-btn-group examples--custom-toolbar">
          <button
            type="button"
            className="flex items-center justify-center !h-10 px-3"
            onClick={() => onNavigate('PREV')}
            aria-label={messages.previous!.toString()}
          >
            &#60; {/* Left Arrow */}
          </button>
          <button
            type="button"
            className="flex items-center justify-center !h-10 px-4 whitespace-nowrap"
            onClick={() => onNavigate('TODAY')}
            aria-label={messages.today!.toString()}
          >
            {displayLabel}
          </button>
          <button
            type="button"
            className="flex items-center justify-center !h-10 px-3"
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
