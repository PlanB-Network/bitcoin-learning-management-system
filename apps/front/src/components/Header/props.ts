export interface NavigationBaseItem {
  id: string;
  title: string;
}

type ActionOrPath = { action: () => void } | { path: string };

export type NavigationElement = NavigationBaseItem & {
  img?: string;
  description?: string;
} & ActionOrPath;
export type NavigationSubSection = NavigationBaseItem &
  (
    | { action: () => void }
    | { path: string }
    | { items: NavigationElement[][] }
  );
export type NavigationSection = NavigationBaseItem &
  (
    | { action: () => void }
    | { path: string }
    | { items: (NavigationSubSection | NavigationElement[])[] }
  );
