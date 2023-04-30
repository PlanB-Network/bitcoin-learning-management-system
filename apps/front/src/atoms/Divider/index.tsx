interface DividerProps {
  children?: string;
}

export const Divider = ({ children }: DividerProps) => {
  return (
    <div className="relative mx-4 w-full">
      <div
        className="flex absolute inset-0 items-center w-full"
        aria-hidden="true"
      >
        <div className="w-full border-t border-gray-300" />
      </div>
      {children && (
        <div className="flex relative justify-center">
          <span className="px-2 text-sm text-gray-500 bg-white">
            {children}
          </span>
        </div>
      )}
    </div>
  );
};
