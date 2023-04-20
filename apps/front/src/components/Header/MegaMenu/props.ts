export interface MegaMenuBaseItem {
  id: string;
  title: string;
  path?: string;
  action?: () => void;
}

export interface MegaMenuElement extends MegaMenuBaseItem {
  img?: string;
  description?: string;
}

export interface MegaMenuSubSection extends MegaMenuBaseItem {
  items: MegaMenuElement[][];
}

export interface MegaMenuSection extends MegaMenuBaseItem {
  items?: (MegaMenuSubSection | MegaMenuElement[])[];
}
