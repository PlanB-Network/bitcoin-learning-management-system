import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { DividerVertical, Tabs, TabsList, TabsTrigger } from '@blms/ui';
import { t } from 'i18next';
import { z } from 'zod';
import PlanBLabsLogo from '#src/assets/logo/plan_b_labs_logo_horizontal.svg';
import { MainLayout } from '#src/components/main-layout.js';

export const Route = createFileRoute(
  '/$lang/_content/_misc/plan-b-labs/$group',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      group: z.string().parse(params.group),
    }),
    stringify: ({ lang, group }) => ({
      lang: lang,
      group: `${group}`,
    }),
  },
  component: TermsAndConditions,
});

export const labsTabs = [
  {
    id: 'lightning',
    label: 'Lightning',
    href: '/plan-b-labs/lightning',
  },
  {
    id: 'mining',
    label: 'Mining',
    href: '/plan-b-labs/mining',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    href: '/plan-b-labs/privacy',
  },
];

function TermsAndConditions() {
  const params = Route.useParams();
  const navigate = useNavigate();

  const activeItem =
    labsTabs.find((tab) => tab.href.includes(params.group)) || labsTabs[0];

  return (
    <MainLayout variant="dark" footerVariant="dark">
      <div className="flex flex-col items-center mt-12 text-center gap-6">
        <div className="flex flex-col items-center lg:gap-6 lg:flex-row lg:w-[800px]">
          <img
            src={PlanBLabsLogo}
            alt="Logo Plan ₿ Labs"
            className="w-36 lg:w-60"
          />
          <DividerVertical className="h-16 max-lg:hidden" />
          <h1 className="display-small-med-32px text-center lg:text-left">
            {t('labs.title')}
          </h1>
        </div>
        <div>
          <p>{t('labs.description1')}</p>
          <p>{t('labs.description2')}</p>
        </div>
      </div>

      <Tabs
        defaultValue={activeItem.label}
        className="w-full hidden lg:flex justify-center mt-7"
      >
        <TabsList size="l" mode="dark">
          {labsTabs.map((tab) => (
            <TabsTrigger
              value={tab.label}
              key={tab.id}
              size="l"
              role="tab"
              onClick={() => {
                if (activeItem.href !== tab.href) {
                  navigate({ to: tab.href });
                }
              }}
            >
              {t(tab.label)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </MainLayout>
  );
}
