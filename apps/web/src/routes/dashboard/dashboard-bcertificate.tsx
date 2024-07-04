import { Link, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { AppContext } from '#src/providers/context.js';

import { DashboardLayout } from '../layout.tsx';

export const DashboardBCertificate = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <h3 className="text-2xl">{t('dashboard.bCertificate')}</h3>

        <section className="flex flex-col gap-4">
          <h4>Assert your level in Bitcoin</h4>
          <p>
            The ₿ Certificate is a table exam organised by Plan B Network and
            designed to assert your level about Bitcoin and all its related
            topics.
          </p>
          <Link to="/b-certificate">
            <Button mode="light" variant="newSecondary" size="m" onHoverArrow>
              Learn more
            </Button>
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          <h4>Want to pass the exam?</h4>
          <div className="flex max-lg:flex-col gap-4 lg:gap-12 lg:items-center">
            <p className="max-w-[495px]">
              The ₿ Certificate is organised by Plan B Network at various
              locations and times. Make sure to book your seat at a session.
            </p>
            <Link to="/b-certificate">
              <Button mode="light" variant="newPrimary" size="m" onHoverArrow>
                Book an exam session
              </Button>
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h4>Grades and diploma</h4>
          <p>
            Here you can find your results to ₿ Certificate exams you’ve passed
            while registered with this account. The results usually takes 2 to 3
            weeks to be processed and available here. If after a long time your
            results don’t show here, please contact us.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
};
