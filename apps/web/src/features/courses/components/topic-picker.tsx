interface TopicPickerProps {
  categories: { prefix: string; topic: string }[];
  activeCategories: string[];
  setActiveCategories: (category: string) => void;
}

export const TopicPicker: React.FC<TopicPickerProps> = ({
  categories,
  activeCategories,
  setActiveCategories,
}: TopicPickerProps) => {
  return (
    <div className="grid grid-cols-2 items-center justify-center md:grid-cols-3 xl:grid-cols-4">
      {categories.map(({ prefix, topic }, index) => (
        <div
          className="my-3 flex flex-row place-items-center space-x-2"
          key={index}
        >
          <div
            className={`flex h-8 w-20 place-items-center justify-center rounded-2xl border-2 border-orange-500 text-base font-semibold uppercase lg:h-10 lg:w-20 lg:text-base  ${
              activeCategories.includes(prefix)
                ? 'bg-orange-500'
                : 'bg-blue-1000'
            }`}
            onClick={() => setActiveCategories(prefix)}
          >
            {prefix}
          </div>
          <span className="w-1/2 text-base font-light capitalize lg:text-base">
            {topic}
          </span>
        </div>
      ))}
    </div>
  );
};
