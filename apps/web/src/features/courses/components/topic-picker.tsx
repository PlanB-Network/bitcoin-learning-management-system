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
    <div className="mt-1 flex flex-wrap items-center justify-start gap-2 sm:mt-0 sm:grid sm:grid-cols-2 sm:gap-0 md:grid-cols-3 xl:grid-cols-4">
      {categories.map(({ prefix, topic }, index) => (
        <div key={prefix}>
          {/* Desktop */}
          <div
            className="my-3 hidden flex-row place-items-center space-x-2 sm:flex"
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
          {/* Mobile */}
          <div
            className="mt-1 flex flex-row place-items-center sm:my-3 sm:hidden"
            key={index + 1000}
          >
            <div
              className={`text-blue-1000 flex h-8 place-items-center justify-center rounded-lg px-4 text-xs ${
                activeCategories.includes(prefix)
                  ? 'bg-orange-500 font-medium'
                  : 'bg-white'
              }`}
              onClick={() => setActiveCategories(prefix)}
            >
              {topic}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
