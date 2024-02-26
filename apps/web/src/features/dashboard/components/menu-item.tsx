export const MenuItem = ({
  text,
  icon,
  active,
  onClick,
}: {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button onClick={onClick}>
    <div
      className={`flex w-full cursor-pointer flex-row items-center justify-center gap-3 px-3 py-2 md:justify-start ${
        active && 'rounded-lg bg-orange-300 md:bg-orange-500'
      }`}
    >
      <div className="min-w-[20px]">{icon}</div>
      <div className="hidden sm:block">{text}</div>
    </div>
  </button>
);
