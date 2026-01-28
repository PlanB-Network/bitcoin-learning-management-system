import { cn, SegmentedControl, SegmentedControlItem } from '@blms/ui';
import { startOfWeek } from 'date-fns';
import type { Messages, ToolbarProps, View } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';
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
  return (
    <SegmentedControl
      value={view}
      onValueChange={(val) => onView(val as View)}
      variant="outline"
      size="sm"
    >
      {views.map((name: View) => (
        <SegmentedControlItem
          className={cn(name === 'week' && 'max-md:hidden')}
          key={name}
          value={name}
        >
          <span className="w-19">{messages[name]}</span>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
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
    <div className="max-md:px-1 mb-5">
      <div className="flex max-md:flex-col justify-between w-full items-center gap-2">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 px-2.5 py-2 border border-neutral-200 rounded-lg text-neutral-700 max-md:order-2">
          <button
            type="button"
            className="flex items-center justify-center border-none! p-0!"
            onClick={() => onNavigate('PREV')}
            aria-label={messages.previous!.toString()}
          >
            <TbChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="flex items-center justify-center whitespace-nowrap
            border-none! p-0!"
            onClick={() => onNavigate('TODAY')}
            aria-label={messages.today!.toString()}
          >
            {displayLabel}
          </button>
          <button
            type="button"
            className="flex items-center justify-center border-none! p-0!"
            onClick={() => onNavigate('NEXT')}
            aria-label={messages.next!.toString()}
          >
            <TbChevronRight size={16} />
          </button>
        </div>

        <span className="rbc-toolbar-label">{displayLabel}</span>

        {/* View Switcher Buttons */}
        <ViewNamesGroup
          view={view}
          views={views}
          messages={messages}
          onView={onView}
        />
      </div>
    </div>
  );
}
