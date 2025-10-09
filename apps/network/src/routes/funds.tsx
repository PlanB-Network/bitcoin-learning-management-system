import { createFileRoute } from '@tanstack/react-router';
import PageBlock from '#src/components/page-block.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/funds')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout>
      <PageBlock>
        <article className="bg-gradient-network-lr">
          <h2 className="title-extra-large">The Cyphertank</h2>
          <p className="subtitle-base text-gray-300 max-w-[500px]">
            Showcase your startup idea in front of industry leaders like Matt
            Odell, Paolo Ardoino, and Oleg. Compete for the chance to win
            $100,000 and make your mark in the global innovation scene. Think
            you’ve got what it takes to be the next big founder? Step up, pitch
            your vision, and seize the spotlight.
          </p>
          <div className="mt-6">
            <p>BLA</p>
            <p>BLA</p>
            <p>BLA</p>
          </div>
        </article>
      </PageBlock>
    </PageLayout>
  );
}
