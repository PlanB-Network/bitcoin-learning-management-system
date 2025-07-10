import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineDownload } from 'react-icons/hi';
import XLSX from 'xlsx';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@blms/ui';

import type { AdminContentManagementCourse } from '@blms/types';
import { CommonModal } from '#src/components/ui/common-modal.tsx';

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: AdminContentManagementCourse[];
  getLanguageName: (code: string) => string;
}

export const DateFilterModal = ({
  isOpen,
  onClose,
  courses,
  getLanguageName,
}: DateFilterModalProps) => {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [fromMonth, setFromMonth] = useState<string>('');
  const [toMonth, setToMonth] = useState<string>('');

  /* ------------------------------------------------------------- */
  /* Available years / months                                       */
  /* ------------------------------------------------------------- */
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        courses.map((c) =>
          c.updatedAt ? new Date(c.updatedAt).getFullYear().toString() : '',
        ),
      ),
    )
      .filter((y) => y)
      .sort();
  }, [courses]);

  const monthOptions = useMemo(
    () => [
      { value: '0', label: t('months.january') },
      { value: '1', label: t('months.february') },
      { value: '2', label: t('months.march') },
      { value: '3', label: t('months.april') },
      { value: '4', label: t('months.may') },
      { value: '5', label: t('months.june') },
      { value: '6', label: t('months.july') },
      { value: '7', label: t('months.august') },
      { value: '8', label: t('months.september') },
      { value: '9', label: t('months.october') },
      { value: '10', label: t('months.november') },
      { value: '11', label: t('months.december') },
    ],
    [t],
  );

  /* ------------------------------------------------------------- */
  /* Helpers                                                       */
  /* ------------------------------------------------------------- */
  const reset = () => {
    setSelectedYear('');
    setFromMonth('');
    setToMonth('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const downloadFilteredReport = () => {
    if (!selectedYear || fromMonth === '' || toMonth === '') return;

    const from = new Date(Number(selectedYear), Number(fromMonth), 1);
    // Use last day of toMonth
    const to = new Date(
      Number(selectedYear),
      Number(toMonth) + 1,
      0,
      23,
      59,
      59,
    );

    const filtered = courses.filter((row) => {
      const date = new Date(row.updatedAt);
      return date >= from && date <= to;
    });

    if (filtered.length === 0) return;

    const data = filtered.map((row) => ({
      'Course Index': row.index,
      'Course Name': row.courseName ?? '',
      Language: getLanguageName(row.language),
      Contributor: row.assigneeDisplayName || row.assigneeUsername || '',
      Status: row.status,
      Progress: `${row.progress}%`,
      'Last Updated': new Date(row.updatedAt).toLocaleDateString('en-GB'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Courses');

    const filename = `Courses_Report_${selectedYear}_${Number(fromMonth) + 1}-${Number(toMonth) + 1}.xlsx`;
    XLSX.writeFile(wb, filename);

    handleClose();
  };

  /* ------------------------------------------------------------- */
  /* Render                                                         */
  /* ------------------------------------------------------------- */

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('dashboard.adminPanel.translationPanel.reports.dateFilter')}
      maxWidth="max-w-lg"
      actions={
        <>
          <Button variant="outline" onClick={handleClose} size="s">
            {t('words.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={downloadFilteredReport}
            size="s"
            disabled={!selectedYear || fromMonth === '' || toMonth === ''}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {t('dashboard.adminPanel.translationPanel.reports.downloadData')}
            <HiOutlineDownload className="w-4 h-4" />
          </Button>
        </>
      }
    >
      {/* Course info could be passed later; for now we export across all courses */}
      <div className="w-full space-y-4">
        {/* Year select */}
        <div>
          <span className="block mb-1 text-sm font-medium text-gray-700">
            {t('dashboard.adminPanel.translationPanel.reports.year')}
          </span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full bg-white border-gray-300">
              <SelectValue
                placeholder={t(
                  'dashboard.adminPanel.translationPanel.reports.chooseYear',
                )}
              />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border-gray-300">
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Months range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block mb-1 text-sm font-medium text-gray-700">
              {t('dashboard.adminPanel.translationPanel.reports.fromMonth')}
            </span>
            <Select value={fromMonth} onValueChange={setFromMonth}>
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue
                  placeholder={t(
                    'dashboard.adminPanel.translationPanel.reports.fromMonthPlaceholder',
                  )}
                />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-white border-gray-300">
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="block mb-1 text-sm font-medium text-gray-700">
              {t('dashboard.adminPanel.translationPanel.reports.toMonth')}
            </span>
            <Select value={toMonth} onValueChange={setToMonth}>
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue
                  placeholder={t(
                    'dashboard.adminPanel.translationPanel.reports.toMonthPlaceholder',
                  )}
                />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-white border-gray-300">
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </CommonModal>
  );
};
