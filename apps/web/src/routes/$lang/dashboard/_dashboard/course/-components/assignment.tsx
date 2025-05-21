import { t } from 'i18next';
import { CollapsibleDropdown } from '#src/components/Dropdown/collapsible-dropdown.tsx';

export const Assignment = ({
  courseId,
}: {
  courseId: string;
}) => {
  return (
    <section className="flex flex-col mt-4 md:mt-10 w-full max-w-[1000px] gap-6">
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
        {t('dashboard.course.assignment')}
      </h2>
      <CollapsibleDropdown
        title={t('dashboard.course.assignmentInformation')}
        className="border border-newGray-4"
        variant="dark"
        defaultOpen={true}
        type="info"
      >
        <p className="whitespace-pre-line text-newBlack-4 max-md:text-sm">
          {t('dashboard.course.assignmentDescription')}
        </p>

        {new Date().getTime() > new Date('2025-06-02T02:00:00Z').getTime() && (
          <p>
            {/* If the user is selected for assignments, show the form to do the ranking. */}
          </p>
        )}
      </CollapsibleDropdown>
    </section>
  );
};
