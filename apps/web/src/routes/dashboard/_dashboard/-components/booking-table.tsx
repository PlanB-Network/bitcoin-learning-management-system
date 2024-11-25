import { useTranslation } from 'react-i18next';

import type { CalendarEvent, ExtendedUserEvent } from '@blms/types';
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
  participants: ExtendedUserEvent[];
}

const convertToCSV = (data: ExtendedUserEvent[]) => {
  const header = ['Index', 'Username', 'Display Name'].join(',');

  const rows = data.map((row, index) =>
    [index + 1, row.username, row.displayName || '']
      .map((value) => `"${value}"`)
      .join(','),
  );

  return [header, ...rows].join('\n');
};

const handleDownload = (
  participants: ExtendedUserEvent[],
  eventName: string,
) => {
  if (!participants || participants.length === 0) {
    console.error('No participants available for download.');
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
    });
  const eventIds = allEvents ? allEvents.map((event) => event.id) : [];

  const { data: participantsData, isFetched: isParticipantsFetched } =
    trpc.user.events.getParticipantsForEvents.useQuery({
      eventIds,
    });

  if (!isFetched || !isParticipantsFetched) {
    return <Loader size="s" />;
  }

  const getParticipantsForEvents = (eventId: string) =>
    participantsData?.filter(
      (participant) => participant.eventId === eventId,
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
            {allEvents?.map((event) => {
              const eventParticipants = getParticipantsForEvents(event.id);
              return (
                <EventRow
                  key={event.id}
                  event={event}
                  participants={eventParticipants}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        {allEvents?.map((event) => {
          const eventParticipants = getParticipantsForEvents(event.id);
          return (
            <EventCard
              key={event.id}
              event={event}
              participants={eventParticipants}
            />
          );
        })}
      </div>
    </div>
  );
};

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
