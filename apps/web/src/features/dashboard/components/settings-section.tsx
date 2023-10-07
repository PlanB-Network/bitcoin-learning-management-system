export const SettingsSectionTitle = ({ children }: { children: string }) => (
  <div className="text-blue-600 px-1 text-lg font-semibold uppercase">
    {children}
  </div>
);

export const SettingsSectionCard = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => (
  <div className="text-blue-700 flex w-full flex-col space-y-2 rounded-xl border border-gray-300 bg-white px-4 py-2 md:bg-transparent">
    {children}
  </div>
);

export const SettingsSection = ({
  children,
}: {
  children: [
    React.ReactElement<typeof SettingsSectionTitle>,
    React.ReactElement<typeof SettingsSectionCard>
  ];
}) => <div className="flex flex-col space-y-4">{children}</div>;
