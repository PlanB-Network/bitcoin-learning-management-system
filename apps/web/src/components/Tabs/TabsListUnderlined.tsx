import { cn, TabsList, TabsTrigger } from '@blms/ui';

interface TabsListUnderlinedProps {
  tabs: Array<{
    value: string;
    key: string;
    text: string;
    active: boolean;
    disabled?: boolean;
  }>;
  slice?: number;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const TabsListUnderlined = ({
  tabs,
  slice,
  children,
  variant = 'primary',
}: TabsListUnderlinedProps) => {
  const variantClasses = {
    primary:
      'text-newBlack-3 data-[state=active]:border-darkOrange-5 data-[state=active]:text-black data-[state=inactive]:hover:text-black',
    secondary: '',
  };

  return (
    <TabsList
      className="flex overflow-x-scroll no-scrollbar max-w-full gap-8"
      removeDefaultClasses={true}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          value={tab.value}
          key={tab.key}
          className={cn(
            'max-lg:label-medium-med-16px text-xl hover:font-medium data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap pb-2.5 lg:pb-4 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2',
            variantClasses[variant],
          )}
          disabled={tab.disabled}
          removeDefaultClasses={true}
        >
          <span className="line-clamp-2">
            {slice && tab.active ? tab.text : tab.text.slice(0, slice)}
          </span>
        </TabsTrigger>
      ))}
      {children}
    </TabsList>
  );
};
