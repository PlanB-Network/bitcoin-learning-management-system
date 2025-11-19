import { cn } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import { TbSearch } from 'react-icons/tb';

export const SearchInput = ({
  searchTerm,
  setSearchTerm,
  className,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  className?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'relative h-9 lg:h-11 w-full transition-[min-width] ease-in-out min-w-0 max-w-40 lg:max-w-56 focus-within:min-w-[200px]',
        searchTerm && 'min-w-[200px]',
        className,
      )}
    >
      <input
        type="text"
        placeholder={t('words.searchTripleDot')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="body-base lg:dropdown-small w-full h-full px-3 pr-9 bg-neutral-50 rounded-lg lg:rounded-xl text-neutral-600 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
        <TbSearch size={16} strokeWidth={1.5} />
      </div>
    </div>
  );
};
