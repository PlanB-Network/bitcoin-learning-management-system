import { useTranslation } from 'react-i18next';

import type { CalendarEvent, CalendarEventParticipant } from '@blms/types';
import {
  Button,
  Card,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@blms/ui';

import { formatDateWithoutTime } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

interface EventProps {
  event: CalendarEvent;
  participants: CalendarEventParticipant[];
}

const convertToCSV = (data: CalendarEventParticipant[]) => {
  const header = ['Index', 'Username', 'Display Name'].join(',');

  const rows = data.map((row, index) =>
    [index + 1, row.username, row.displayName || '']
      .map((value) => `"${value}"`)
      .join(','),
  );

  return [header, ...rows].join('\n');
};

// TODO: Improve notification system when there are not participants
const handleDownload = (
  participants: CalendarEventParticipant[],
  eventName: string,
) => {
  if (!participants || participants.length === 0) {
    alert('There are no participants for this event!');
    return;
  }

  const csvData = convertToCSV(participants);
  const blob = new Blob([csvData], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  const sanitizedEventName = eventName
    .replaceAll(/[^\da-z]/gi, '_')
    .toLowerCase();
  const filename = `${sanitizedEventName}_participants.csv`;
  link.download = filename;
  link.click();
};

const BookingTable = () => {
  const { t } = useTranslation();

  const { data: allEvents, isFetched } =
    trpc.user.calendar.getCalendarEvents.useQuery({
      language: 'en',
      upcomingEvents: true,
      userSpecific: false,
    });

  const sortedEvents = allEvents
    ?.filter((event) => event.type !== 'conference')
    .sort((a, b) => {
      const dateA = new Date(a.startDate || 0).getTime();
      const dateB = new Date(b.startDate || 0).getTime();
      return dateA - dateB;
    });

  const { data: participantsData, isFetched: isParticipantsFetched } =
    trpc.user.events.getParticipantsForEvent.useQuery();

  if (!isFetched || !isParticipantsFetched) {
    return <Loader size="s" />;
  }

  const getParticipantsForEvents = (eventId: string, subId: string | null) =>
    participantsData?.filter(
      (participant) => participant.id === eventId || participant.id === subId,
    ) || [];

  return (
    <div>
      <div className="overflow-x-auto max-md:hidden md:flex">
        <Table className="!max-w-[910px] max-h-full">
          <TableHeader className="border-b-0 *:text-base *:font-medium *:text-dashboardSectionTitle">
            <TableRow>
              <TableHead className="w-[137px]">
                {t('dashboard.adminPanel.type')}
              </TableHead>
              <TableHead className="w-[420px]">
                {t('dashboard.adminPanel.nameOfEvent')}
              </TableHead>
              <TableHead className="w-[180px]">
                {t('dashboard.adminPanel.date')}
              </TableHead>
              <TableHead className="flex justify-center w-[180px]">
                {t('dashboard.adminPanel.listOfParticipants')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents?.map((event) => {
              const eventParticipants = getParticipantsForEvents(
                event.id,
                event.subId,
              );
              return (
                <EventRow
                  key={event.name}
                  event={event}
                  participants={eventParticipants}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        {sortedEvents?.map((event) => {
          const eventParticipants = getParticipantsForEvents(
            event.id,
            event.subId,
          );
          return (
            <EventCard
              key={event.name}
              event={event}
              participants={eventParticipants}
            />
          );
        })}
      </div>
    </div>
  );
};

// TODO: Add counter to how many participants are on one event so we know there are participants there or find some other solution with Muriel and team
const EventRow = ({ event, participants }: EventProps) => {
  const { t } = useTranslation();
  const startDate = event.startDate || new Date();

  return (
    <TableRow className="*:capitalize">
      <TableCell>{event.type}</TableCell>
      <TableCell>{event.name}</TableCell>
      <TableCell>{formatDateWithoutTime(startDate)}</TableCell>
      <TableCell>
        <Button
          size="s"
          className="mx-auto"
          onClick={() => handleDownload(participants, event.name)}
        >
          {t('dashboard.adminPanel.downloadList')}
        </Button>
      </TableCell>
    </TableRow>
  );
};

const EventCard = ({ event, participants }: EventProps) => {
  const { t } = useTranslation();

  const startDate = event.startDate || new Date();

  return (
    <Card withPadding={false} className="flex md:hidden p-3" color="gray">
      <div className="flex flex-col gap-1">
        <span className="text-newBlack-1 mobile-subtitle1">{event.name}</span>
        <span className="flex-none text-sm text-newBlack-5">
          {formatDateWithoutTime(startDate)}
          <span className="inline-block mx-1 text-newBlack-5">·</span>
          <span className="capitalize text-newBlack-5">{event.type}</span>
        </span>
        <span>
          <Button
            variant="primary"
            size="xs"
            onClick={() => handleDownload(participants, event.name)}
          >
            {t('dashboard.adminPanel.downloadList')}
          </Button>
        </span>
      </div>
    </Card>
  );
};

export default BookingTable;
