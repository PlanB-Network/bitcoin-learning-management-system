import { NotificationType, StudentGroup } from '@blms/constants';
import type { ScheduledCourseAnnouncement } from '@blms/types';
import {
  BasicModal,
  Button,
  Calendar,
  cn,
  Field,
  FieldError,
  FieldLabel,
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
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuCalendar } from 'react-icons/lu';
import { z } from 'zod';
import { AppContext } from '#src/providers/context.tsx';
import { getNotificationIcon } from '#src/routes/$lang/notifications/index.tsx';
import { getUTCOffset, timeZones } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

interface AnnouncementModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
  existingAnnouncement?: ScheduledCourseAnnouncement;
}

export const AnnouncementModal = ({
  courseId,
  isOpen,
  onClose,
  existingAnnouncement,
}: AnnouncementModalProps) => {
  const { t } = useTranslation();

  const schema = z.object({
    content: z.string().min(1, { message: t('courses.review.fieldRequired') }),
    dateTime: z.date({
      error: t('dashboard.teacher.courses.announcementModal.dateRequired'),
    }),
    studentGroup: z.enum(StudentGroup).optional(),
    timezone: z.string(),
    type: z.string(),
  });

  type FormData = z.infer<typeof schema>;

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

  const submitScheduledCourseAnnouncement = useMutation(
    trpc.user.notifications.insertScheduledCourseAnnouncement.mutationOptions({
      onSuccess: () => {
        closeModal();
      },
    }),
  );

  const updateScheduledCourseAnnouncement = useMutation(
    trpc.user.notifications.updateScheduledCourseAnnouncement.mutationOptions({
      onSuccess: () => {
        closeModal();
      },
    }),
  );

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
        content: data.content,
        courseId,
        id: existingAnnouncement.id,
        scheduledAt: scheduledUtcDate,
        studentGroup: data.studentGroup || StudentGroup.All,
        timezone: data.timezone,
        type: data.type as NotificationType,
      });
    } else {
      submitScheduledCourseAnnouncement.mutate({
        content: data.content,
        courseId,
        scheduledAt: scheduledUtcDate,
        studentGroup: data.studentGroup || StudentGroup.All,
        timezone: data.timezone,
        type: data.type as NotificationType,
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
        content: existingAnnouncement.content,
        studentGroup: existingAnnouncement.studentGroup as StudentGroup,
        type: existingAnnouncement.type,
      });
    } else {
      form.reset({
        content: '',
        dateTime: new Date(),
        studentGroup: StudentGroup.All,
        timezone: 'GMT',
        type: NotificationType.Warning,
      });
      setDate(null);
      setTime('00:00');
      setTimezone('GMT');
    }
  }, [existingAnnouncement, form]);

  return (
    <BasicModal
      title={
        existingAnnouncement
          ? t('dashboard.teacher.courses.announcementModal.editAnnouncement')
          : t('dashboard.teacher.courses.announcementModal.title')
      }
      open={isOpen}
      onOpenChange={() => closeModal()}
    >
      <div className="flex flex-col gap-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 md:gap-10"
        >
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-left" htmlFor={field.name} required>
                  {t('dashboard.teacher.courses.announcementModal.typeLabel')}
                </FieldLabel>

                <Select onValueChange={field.onChange} value={field.value}>
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

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="content"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-left" htmlFor={field.name} required>
                  {t(
                    'dashboard.teacher.courses.announcementModal.contentLabel',
                  )}
                </FieldLabel>

                <Textarea
                  placeholder={t(
                    'dashboard.teacher.courses.announcementModal.contentPlaceholder',
                  )}
                  className="min-h-25 bg-white border-newGray-3"
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {isPlanBSchoolCourse && (
            <Controller
              control={form.control}
              name="studentGroup"
              defaultValue={StudentGroup.All}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-left" htmlFor={field.name}>
                    {t(
                      'dashboard.teacher.courses.announcementModal.groupLabel',
                    )}
                  </FieldLabel>

                  <div className="flex flex-col gap-2 pl-4 text-left">
                    {[
                      {
                        label: t('dashboard.announcements.groups.all'),
                        value: 'all',
                      },
                      {
                        label: t('dashboard.announcements.groups.active'),
                        value: 'assignment',
                      },
                      {
                        label: t('dashboard.announcements.groups.summer'),
                        value: 'summer',
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

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
          <div className="flex flex-col gap-2">
            <FieldLabel required>
              {t('dashboard.announcements.publicationDate')}
            </FieldLabel>

            <Controller
              control={form.control}
              name="dateTime"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex flex-col w-full max-w-[320px]"
                >
                  <FieldLabel required>{t('words.day')}</FieldLabel>

                  <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          'flex items-center justify-between rounded-lg bg-white border-newGray-3 px-3 py-2 text-sm leading-[120%] text-newBlack-1 data-placeholder:text-newGray-2 dark:bg-transparent dark:border-newGray-4 border shadow-none',
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
                        <LuCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-auto p-0 z-60 bg-white"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        startMonth={new Date()}
                        selected={date || field.value}
                        onSelect={(selectedDate) => {
                          const [hours, minutes] = time.split(':')!;
                          selectedDate?.setHours(
                            Number(hours),
                            Number(minutes),
                          );
                          setDate(selectedDate!);
                          field.onChange(selectedDate);
                        }}
                        onDayClick={() => setIsDateOpen(false)}
                        endMonth={new Date(new Date().getFullYear() + 3, 11)}
                        disabled={(date) =>
                          Number(date) < Date.now() - 1000 * 60 * 60 * 24
                        }
                        defaultMonth={field.value}
                        className="border border-newGray-4 rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="dateTime"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex flex-col"
                >
                  <FieldLabel required>{t('words.time')}</FieldLabel>

                  <Select
                    defaultValue={time!}
                    onValueChange={(value) => {
                      setTime(value);

                      if (date) {
                        const [h, m] = value.split(':');
                        const newDate = new Date(date.getTime());
                        newDate.setHours(Number(h), Number(m));
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
                      <ScrollArea className="h-60">
                        {Array.from({ length: 96 }).map((_, i) => {
                          const hour = `${Math.floor(i / 4)}`.padStart(2, '0');
                          const minute = `${(i % 4) * 15}`.padStart(2, '0');
                          return (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
                            <SelectItem key={i} value={`${hour}:${minute}`}>
                              {hour}:{minute}
                            </SelectItem>
                          );
                        })}
                      </ScrollArea>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="timezone"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="flex flex-col w-full max-w-[320px]"
                >
                  <FieldLabel required>{t('words.timeZone')}</FieldLabel>

                  <Select
                    value={field.value}
                    defaultValue={timezone}
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
                      <ScrollArea className="h-60">
                        {Object.entries(timeZones)
                          .sort(([a], [b]) => {
                            const offsetA = getUTCOffset(a);
                            const offsetB = getUTCOffset(b);
                            const numericA =
                              Number.parseInt(
                                offsetA.replace('UTC', '').replace('+', ''),
                                10,
                              ) || 0;
                            const numericB =
                              Number.parseInt(
                                offsetB.replace('UTC', '').replace('+', ''),
                                10,
                              ) || 0;
                            return numericA - numericB;
                          })
                          .map(([timeZoneKey, description]) => (
                            <SelectItem key={timeZoneKey} value={timeZoneKey}>
                              {`(${getUTCOffset(timeZoneKey)}) ${description}`}
                            </SelectItem>
                          ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
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
      </div>
    </BasicModal>
  );
};
