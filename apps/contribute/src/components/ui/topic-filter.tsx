import { Button } from '@blms/ui';

interface TopicFilterProps {
  topics: string[];
  selectedTopic: string;
  onTopicSelect: (topic: string) => void;
  title: string;
  className?: string;
}

export const TopicFilter = ({
  topics,
  selectedTopic,
  onTopicSelect,
  title,
  className = '',
}: TopicFilterProps) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h3 className="text-lg font-medium mb-3 text-gray-900">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Button
            key={topic}
            type="button"
            onClick={() => onTopicSelect(topic)}
            variant={selectedTopic === topic ? 'primary' : 'outline'}
            size="flagsMobile"
            className={`flex items-center gap-[10px] h-[32px] px-[10px] rounded-[8px] text-sm font-medium ${
              selectedTopic === topic
                ? 'shadow-[0_2px_3px_rgba(0,0,0,0.25)]'
                : 'bg-white !shadow-none'
            }`}
          >
            {topic}
          </Button>
        ))}
      </div>
    </div>
  );
};
