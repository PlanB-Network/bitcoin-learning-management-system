import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/funds')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout>
      <div className="text-center">
        <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
          Funds
        </header>
      </div>
    </PageLayout>
  );
}
