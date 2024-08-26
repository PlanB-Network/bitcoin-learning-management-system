export interface NavigationBaseItem {
  id: string;
  title?: string;
  mobileIcon?: string;
}

type ActionOrPath = { action: () => void } | { path: string };

export type NavigationElement = (NavigationBaseItem & {
  icon?: string;
  description?: string;
}) &
  ActionOrPath;

export type NavigationSubSection = NavigationBaseItem &
  ({ action: () => void } | { path: string } | { items: NavigationElement[] });
export type NavigationSection = NavigationBaseItem &
  (ActionOrPath | { items: Array<NavigationSubSection | NavigationElement> });
