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
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface AnnouncementModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

const schema = z.object({
  type: z.string(),
  content: z.string().min(1, { message: t('courses.review.fieldRequired') }),
  studentGroup: z.string(),
  publishDate: z.date({
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

  function closeModal() {
    onClose();
    form.reset();
  }

  async function onSubmit(data: FormData) {
    console.log(data);
    closeModal();
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-3xl p-6 w-[90%] overflow-auto">
        <DialogTitle>
          {t('dashboard.teacher.courses.announcementModal.title')}
        </DialogTitle>
        <DialogDescription className="hidden" />
        <div className="flex flex-col gap-6 lg:m-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left" required>
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
                          {Object.values(NotificationType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`notification.types.${type}`)}
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
                    <FormLabel className="text-left" required>
                      {t(
                        'dashboard.teacher.courses.announcementModal.contentLabel',
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'dashboard.teacher.courses.announcementModal.contentPlaceholder',
                        )}
                        className="min-h-[150px] bg-white border-newGray-3"
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
                    <FormLabel>
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
                            value: 'active',
                            label: t('dashboard.announcements.groups.active'),
                          },
                          {
                            value: 'inactive',
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

              <FormField
                control={form.control}
                name="publishDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-left" required>
                      {t(
                        'dashboard.teacher.courses.announcementModal.dateLabel',
                      )}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>
                                {t(
                                  'dashboard.teacher.courses.announcementModal.datePlaceholder',
                                )}
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
