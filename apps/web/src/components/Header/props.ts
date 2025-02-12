export interface NavigationBaseItem {
  id: string;
  title?: string;
  mobileIcon?: string;
  removeFilterOnIcon?: boolean;
}

type ActionOrPath = { action: () => void } | { path: string };

export type NavigationElement = (NavigationBaseItem & {
  icon?: string;
  description?: string;
  search?: {
    [key: string]: string | number | boolean | string[] | number[] | boolean[];
  };
}) &
  ActionOrPath;

export type NavigationSubSection = NavigationBaseItem &
  ({ action: () => void } | { path: string } | { items: NavigationElement[] });
export type NavigationSection = NavigationBaseItem &
  (ActionOrPath | { items: Array<NavigationSubSection | NavigationElement> });

// Mobile specific
export type NavigationElementMobile = (NavigationBaseItem & {
  icon?: string | React.ReactNode;
  description?: string;
}) &
  ActionOrPath;
export type NavigationSectionMobile = NavigationBaseItem &
  (ActionOrPath | { items: NavigationElementMobile[] });
