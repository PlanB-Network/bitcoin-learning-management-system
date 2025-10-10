import { createFileRoute } from '@tanstack/react-router';
import PageBlock from '#src/components/page-block.tsx';

export const Route = createFileRoute('/hubs')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-center">
      <PageBlock>
        <h1 className="text-4xl font-bold mb-8">Hubs</h1>
        <p className="mb-4">This is the Hubs page. More content coming soon!</p>
      </PageBlock>
      <div className="shadow-top-bottom-box py-24">
        <PageBlock>
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
        </PageBlock>
      </div>
    </div>
  );
}
