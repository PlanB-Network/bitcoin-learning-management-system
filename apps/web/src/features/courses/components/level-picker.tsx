import { useTranslation } from 'react-i18next';

interface LevelPickerProps {
  levels: { prefix: string; name: string; translatedName: string }[];
  activelevels: string[];
  setActivelevels: (category: string) => void;
}

export const LevelPicker: React.FC<LevelPickerProps> = ({
  levels,
  activelevels,
  setActivelevels,
}) => {
  const handleLevelClick = (level: string) => {
    setActivelevels(t(level));
  };

  const { t } = useTranslation();
  return (
    <div className="flex space-x-2 text-base">
      <div className="my-1 flex flex-wrap gap-2 sm:my-3 sm:flex-row sm:gap-12">
        {levels.map((level, index) => (
          <div key={level.prefix}>
            {/* Desktop */}
            <div
              className="hidden flex-row place-items-center space-x-2 sm:flex"
              key={index}
            >
              <div
                className={`flex h-8 w-14 place-items-center justify-center border-2 
              border-orange-500 text-base font-semibold uppercase lg:h-10 lg:w-16 lg:text-base  ${
                activelevels.includes(level.name)
                  ? 'bg-orange-500'
                  : 'bg-blue-1000'
              }`}
                onClick={() => handleLevelClick(t(level.name))}
              >
                {level.prefix}
              </div>
              <span className="w-1/2 text-base font-light capitalize lg:text-base">
                {level.translatedName}
              </span>
            </div>
            {/* Mobile */}
            <div
              className="mt-1 flex flex-row place-items-center sm:my-3 sm:hidden"
              key={index + 1000}
            >
              <div
                className={`text-blue-1000 flex h-8 place-items-center justify-center rounded-lg px-4 text-xs  ${
                  activelevels.includes(level.name)
                    ? 'bg-orange-500 font-medium'
                    : 'bg-white'
                }`}
                onClick={() => handleLevelClick(t(level.name))}
              >
                {level.translatedName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
