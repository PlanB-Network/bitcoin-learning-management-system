export interface NavigationBaseItem {
  id: string;
  title?: string;
  mobileIcon?: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
}

type ActionOrPath = { action: () => void } | { path: string };

export type NavigationElement = (NavigationBaseItem & {
  icon?: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  description?: string;
}) &
  ActionOrPath;

export type NavigationSubSection = NavigationBaseItem &
  ({ action: () => void } | { path: string } | { items: NavigationElement[] });
export type NavigationSection = NavigationBaseItem &
  (ActionOrPath | { items: Array<NavigationSubSection | NavigationElement> });
