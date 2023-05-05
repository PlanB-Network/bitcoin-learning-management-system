import { Card } from '../../../atoms/Card';
import { Contributor } from '../../../components/Contributor';

interface BookSummaryProps {
  contributor?: {
    username: string;
    title?: string;
    image?: string;
  };
  content: string;
  title: string;
}

export const BookSummary = ({
  contributor,
  content,
  title,
}: BookSummaryProps) => {
  return (
    <Card className="max-w-[740px] px-6">
      <header className="flex flex-row justify-between">
        <div>
          <h4 className="text-2xl font-semibold">Book summary</h4>
          <h5 className="mt-2">{title}</h5>
        </div>

        {contributor && (
          <Contributor prefix="Powered by" contributor={contributor} />
        )}
      </header>

      <p className="mt-8 mb-4 text-xs text-justify">{content}</p>
    </Card>
  );
};
