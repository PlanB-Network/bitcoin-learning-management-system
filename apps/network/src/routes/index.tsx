import { createFileRoute } from '@tanstack/react-router';
import PageBlock from '#src/components/page-block.tsx';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="text-center">
      <PageBlock>
        <h1 className="text-4xl font-bold mb-8">Home page</h1>
      </PageBlock>
      <div className="shadow-top-bottom-box py-24">
        <PageBlock>
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
        </PageBlock>
      </div>
      <PageBlock>
        <h1 className="h-60">
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
        </h1>
      </PageBlock>
      <div className="py-24 bg-gradient-network-bt ">
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
