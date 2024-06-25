interface DividerProps {
  children?: string;
}

export const Divider = ({ children }: DividerProps) => {
  return (
    <div className="relative mx-4 w-full">
      <div
        className="absolute inset-0 flex w-full items-center"
        aria-hidden="true"
      >
        <div className="w-full border-t border-gray-300" />
      </div>
      {children && (
        <div className="relative flex justify-center">
          <span className="px-2 desktop-body1 text-newGray-1 bg-white">
            {children}
          </span>
        </div>
      )}
    </div>
  );
};
