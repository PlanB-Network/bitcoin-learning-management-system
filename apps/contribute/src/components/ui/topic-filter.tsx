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
          <button
            type="button"
            key={topic}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTopic === topic
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onTopicSelect(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};
