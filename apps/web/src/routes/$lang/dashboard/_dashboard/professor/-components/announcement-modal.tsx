import { NotificationType, StudentGroup } from '@blms/constants';
import type { ScheduledCourseAnnouncement } from '@blms/types';
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { t } from 'i18next';
import { CalendarIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AppContext } from '#src/providers/context.tsx';
import { getUTCOffset, timeZones } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import { getNotificationIcon } from '../../notifications.tsx';

interface AnnouncementModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
  existingAnnouncement?: ScheduledCourseAnnouncement;
}

const schema = z.object({
  type: z.string(),
  content: z.string().min(1, { message: t('courses.review.fieldRequired') }),
  studentGroup: z.nativeEnum(StudentGroup).optional(),
  dateTime: z.date({
    required_error: t(
      'dashboard.teacher.courses.announcementModal.dateRequired',
    ),
  }),
  timezone: z.string(),
});

type FormData = z.infer<typeof schema>;

export const AnnouncementModal = ({
  courseId,
  isOpen,
  onClose,
  existingAnnouncement,
}: AnnouncementModalProps) => {
  const { t } = useTranslation();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { courses } = useContext(AppContext);

  const isPlanBSchoolCourse = courses?.some(
    (course) => course.id === courseId && course.isPlanbSchool,
  );

  const [isDateOpen, setIsDateOpen] = useState(false);

  const [time, setTime] = useState<string>(
    existingAnnouncement
      ? format(new Date(existingAnnouncement.scheduledAt), 'HH:mm') || '00:00'
      : '00:00',
  );
  const [date, setDate] = useState<Date | null>(
    existingAnnouncement ? new Date(existingAnnouncement.scheduledAt) : null,
  );
  const [timezone, setTimezone] = useState<string>(
    existingAnnouncement ? existingAnnouncement.timezone : 'GMT',
  );

  const submitScheduledCourseAnnouncement =
    trpc.user.notifications.insertScheduledCourseAnnouncement.useMutation({
      onSuccess: () => {
        closeModal();
      },
    });

  const updateScheduledCourseAnnouncement =
    trpc.user.notifications.updateScheduledCourseAnnouncement.useMutation({
      onSuccess: () => {
        closeModal();
      },
    });

  function closeModal() {
    onClose();
    setIsDateOpen(false);
    setDate(null);
    setTime('00:00');
    setTimezone('GMT');
    form.reset();
  }

  async function onSubmit(data: FormData) {
    const datePart = format(data.dateTime, 'yyyy-MM-dd');
    const timePart = time;
    const dateTimeStringInZone = `${datePart} ${timePart}`;
    const targetTimeZone = data.timezone;

    let scheduledUtcDate: Date;
    try {
      scheduledUtcDate = fromZonedTime(dateTimeStringInZone, targetTimeZone);
    } catch (error) {
      console.error('Error converting date/time/timezone:', error);
      return;
    }

    if (existingAnnouncement) {
      updateScheduledCourseAnnouncement.mutate({
        courseId,
        type: data.type as NotificationType,
        content: data.content,
        studentGroup: data.studentGroup || StudentGroup.All,
        scheduledAt: scheduledUtcDate,
        timezone: data.timezone,
        id: existingAnnouncement.id,
      });
    } else {
      submitScheduledCourseAnnouncement.mutate({
        courseId,
        type: data.type as NotificationType,
        content: data.content,
        studentGroup: data.studentGroup || StudentGroup.All,
        scheduledAt: scheduledUtcDate,
        timezone: data.timezone,
      });
    }
  }

  const notificationOptions = [
    NotificationType.Warning,
    NotificationType.Calendar,
    NotificationType.General,
    NotificationType.Assignment,
    NotificationType.Celebration,
  ];

  useEffect(() => {
    if (existingAnnouncement) {
      const utcAnnouncementDate = new Date(existingAnnouncement.scheduledAt);

      const targetTimeZone =
        existingAnnouncement.timezone &&
        existingAnnouncement.timezone in timeZones
          ? existingAnnouncement.timezone
          : 'GMT';

      const zonedAnnouncementDate = toZonedTime(
        utcAnnouncementDate,
        targetTimeZone,
      );
      setTime(format(zonedAnnouncementDate, 'HH:mm'));
      setDate(zonedAnnouncementDate);
      form.setValue('dateTime', zonedAnnouncementDate);

      setTimezone(targetTimeZone);
      form.setValue('timezone', targetTimeZone);

      form.reset({
        ...form.getValues(),
        type: existingAnnouncement.type,
        content: existingAnnouncement.content,
        studentGroup: existingAnnouncement.studentGroup as StudentGroup,
      });
    } else {
      form.reset({
        type: NotificationType.Warning,
        content: '',
        studentGroup: StudentGroup.All,
        dateTime: new Date(),
        timezone: 'GMT',
      });
      setDate(null);
      setTime('00:00');
      setTimezone('GMT');
    }
  }, [existingAnnouncement, form]);

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-[482px] p-6 w-[90%] overflow-auto">
        <DialogTitle className="max-md:subtitle-large-18px">
          {existingAnnouncement
            ? t('dashboard.teacher.courses.announcementModal.editAnnouncement')
            : t('dashboard.teacher.courses.announcementModal.title')}
        </DialogTitle>
        <DialogDescription className="hidden" />
        <div className="flex flex-col gap-6 lg:m-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5 md:gap-10"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left mb-2" required>
                      {t(
                        'dashboard.teacher.courses.announcementModal.typeLabel',
                      )}
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger mode="light" className="md:w-96">
                          <SelectValue
                            placeholder={t(
                              'dashboard.teacher.courses.announcementModal.typePlaceholder',
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent mode="light">
                          {notificationOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              <span className="flex gap-1.5 items-center">
                                {getNotificationIcon(type, 'size-4')}
                                {t(`notification.types.${type.toLowerCase()}`)}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left mb-2" required>
                      {t(
                        'dashboard.teacher.courses.announcementModal.contentLabel',
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'dashboard.teacher.courses.announcementModal.contentPlaceholder',
                        )}
                        className="min-h-[100px] bg-white border-newGray-3"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isPlanBSchoolCourse && (
                <FormField
                  control={form.control}
                  name="studentGroup"
                  defaultValue={StudentGroup.All}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-left mb-2">
                        {t(
                          'dashboard.teacher.courses.announcementModal.groupLabel',
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2 pl-[18px]">
                          {[
                            {
                              value: 'all',
                              label: t('dashboard.announcements.groups.all'),
                            },
                            {
                              value: 'assignment',
                              label: t('dashboard.announcements.groups.active'),
                            },
                            {
                              value: 'summer',
                              label: t('dashboard.announcements.groups.summer'),
                            },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex gap-4 items-start"
                            >
                              <div className="mt-1 grid place-items-center">
                                <input
                                  type="radio"
                                  value={option.value}
                                  checked={field.value === option.value}
                                  onChange={() => field.onChange(option.value)}
                                  className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-white border-darkOrange-5 shrink-0"
                                />
                                <div className="col-start-1 row-start-1 w-2 h-2 rounded-full peer-checked:bg-darkOrange-5" />
                              </div>
                              <span className="text-black label-medium-16px">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex flex-col gap-2">
                <FormLabel required>
                  {t('dashboard.announcements.publicationDate')}
                </FormLabel>
                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full max-w-[320px]">
                      <FormLabel required className="mb-2">
                        {t('words.day')}
                      </FormLabel>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              className={cn(
                                'flex items-center justify-between rounded-lg bg-white border-newGray-3 px-3 py-2 text-sm leading-[120%] text-newBlack-1 data-[placeholder]:text-newGray-2 data-[placeholder]:dark:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate dark:bg-transparent dark:border-newGray-4 border shadow-none',
                              )}
                              type="button"
                            >
                              {field.value ? (
                                `${format(field.value, 'PPP')}, ${time}`
                              ) : (
                                <span className="text-newGray-2">
                                  {t('dashboard.announcements.pickADate')}
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-[60] bg-white"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            fromMonth={new Date()}
                            captionLayout="buttons"
                            selected={date || field.value}
                            onSelect={(selectedDate) => {
                              const [hours, minutes] = time.split(':')!;
                              selectedDate?.setHours(
                                Number.parseInt(hours),
                                Number.parseInt(minutes),
                              );
                              setDate(selectedDate!);
                              field.onChange(selectedDate);
                            }}
                            onDayClick={() => setIsDateOpen(false)}
                            fromYear={new Date().getFullYear()}
                            toYear={new Date().getFullYear() + 3}
                            disabled={(date) =>
                              Number(date) < Date.now() - 1000 * 60 * 60 * 24
                            }
                            defaultMonth={field.value}
                            className="border border-newGray-4 rounded-lg"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel required className="mb-2">
                        {t('words.time')}
                      </FormLabel>
                      <FormControl>
                        <Select
                          defaultValue={time!}
                          onValueChange={(e) => {
                            setTime(e);
                            if (date) {
                              const [hours, minutes] = e.split(':');
                              const newDate = new Date(date.getTime());
                              newDate.setHours(
                                Number.parseInt(hours),
                                Number.parseInt(minutes),
                              );
                              setDate(newDate);
                              field.onChange(newDate);
                            }
                          }}
                        >
                          <SelectTrigger
                            mode="light"
                            className="dark:bg-transparent dark:border-newGray-4 border shadow-none w-fit"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent mode="light">
                            <ScrollArea className="h-[15rem]">
                              {Array.from({ length: 96 }).map((_, i) => {
                                const hour = Math.floor(i / 4)
                                  .toString()
                                  .padStart(2, '0');
                                const minute = ((i % 4) * 15)
                                  .toString()
                                  .padStart(2, '0');
                                return (
                                  <SelectItem
                                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                    key={i}
                                    value={`${hour}:${minute}`}
                                  >
                                    {hour}:{minute}
                                  </SelectItem>
                                );
                              })}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full max-w-[320px]">
                      <FormLabel required className="mb-2">
                        {t('words.timeZone')}
                      </FormLabel>
                      <FormControl defaultValue={timezone}>
                        <Select
                          value={field.value}
                          onValueChange={(selectedValue) => {
                            setTimezone(selectedValue);
                            field.onChange(selectedValue);
                          }}
                        >
                          <SelectTrigger
                            mode="light"
                            className="dark:bg-transparent dark:border-newGray-4 border shadow-none"
                          >
                            <SelectValue
                              placeholder={t('placeholders.selectTimeZone')}
                            />
                          </SelectTrigger>

                          <SelectContent mode="light">
                            <ScrollArea className="h-[15rem]">
                              {Object.entries(timeZones)
                                .sort(([a], [b]) => {
                                  const offsetA = getUTCOffset(a);
                                  const offsetB = getUTCOffset(b);
                                  const numericA =
                                    Number.parseInt(
                                      offsetA
                                        .replace('UTC', '')
                                        .replace('+', ''),
                                      10,
                                    ) || 0;
                                  const numericB =
                                    Number.parseInt(
                                      offsetB
                                        .replace('UTC', '')
                                        .replace('+', ''),
                                      10,
                                    ) || 0;
                                  return numericA - numericB;
                                })
                                .map(([timeZoneKey, description]) => (
                                  <SelectItem
                                    key={timeZoneKey}
                                    value={timeZoneKey}
                                  >
                                    {`(${getUTCOffset(timeZoneKey)}) ${description}`}
                                  </SelectItem>
                                ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center">
                <Button type="submit" variant="primary">
                  {existingAnnouncement
                    ? t('words.save')
                    : t('dashboard.teacher.courses.announcementModal.create')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
