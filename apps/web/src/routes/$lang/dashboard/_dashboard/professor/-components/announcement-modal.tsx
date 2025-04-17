import { NotificationType } from '@blms/constants';
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
import { t } from 'i18next';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { getNotificationIcon } from '../../notifications.tsx';

interface AnnouncementModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

const schema = z.object({
  type: z.string(),
  content: z.string().min(1, { message: t('courses.review.fieldRequired') }),
  studentGroup: z.string(),
  dateTime: z.date({
    required_error: t(
      'dashboard.teacher.courses.announcementModal.dateRequired',
    ),
  }),
});

type FormData = z.infer<typeof schema>;

export const AnnouncementModal = ({
  courseId,
  isOpen,
  onClose,
}: AnnouncementModalProps) => {
  const { t } = useTranslation();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [isDateOpen, setIsDateOpen] = useState(false);

  const [time, setTime] = useState<string>('00:00');
  const [date, setDate] = useState<Date | null>(null);

  function closeModal() {
    onClose();
    form.reset();
  }

  async function onSubmit(data: FormData) {
    console.log(data);
    closeModal();
  }

  const notificationOptions = [
    NotificationType.Warning,
    NotificationType.Calendar,
    NotificationType.General,
    NotificationType.Assignment,
    NotificationType.Celebration,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-3xl p-6 w-[90%] overflow-auto">
        <DialogTitle>
          {t('dashboard.teacher.courses.announcementModal.title')}
        </DialogTitle>
        <DialogDescription className="hidden" />
        <div className="flex flex-col gap-6 lg:m-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-10"
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
                        <SelectTrigger mode="light" className="w-96">
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

              <FormField
                control={form.control}
                name="studentGroup"
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
                            value: 'summerSchool',
                            label: t('dashboard.announcements.groups.inactive'),
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

              <div className="flex w-full gap-4">
                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full max-w-[320px]">
                      <FormLabel>{t('words.date')}</FormLabel>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              size="m"
                              className={cn(
                                'w-full font-normal border-newGray-4 text-newGray-2',
                              )}
                            >
                              {field.value ? (
                                `${format(field.value, 'PPP')}, ${time}`
                              ) : (
                                <span>
                                  {t('dashboard.announcements.pickADate')}
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
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
                      <FormLabel>{t('words.time')}</FormLabel>
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
                          <Button
                            asChild
                            variant="outline"
                            size="m"
                            className={cn('w-full font-normal text-newGray-2')}
                          >
                            <SelectTrigger className="dark:bg-transparent dark:border-newGray-4 border shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                          </Button>
                          <SelectContent>
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
              </div>

              <div className="flex justify-center">
                <Button type="submit" variant="primary">
                  {t('dashboard.teacher.courses.announcementModal.create')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
