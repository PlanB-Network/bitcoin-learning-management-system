import { useMemo } from 'react';

import {
  megaMenuColumnItem,
  megaMenuColumnItemButton,
  megaMenuColumnItemContentContainer,
  megaMenuColumnItemDescription,
  megaMenuColumnItemTextContent,
  megaMenuColumnItemTitle,
  megaMenuImage,
} from '../index.css';
import { MegaMenuElement as IMegaMenuElement } from '../props';

export interface HeaderProps {
  isExpanded: boolean;
}

export interface MegaMenuElementProps {
  element: IMegaMenuElement;
}

export const MegaMenuElement = ({ element }: MegaMenuElementProps) => {
  const htmlElement = useMemo(
    () => (
      <>
        {element.img && (
          <img className={megaMenuImage} src={element.img} alt="library icon" />
        )}
        <div className={megaMenuColumnItemTextContent}>
          <h4 className={megaMenuColumnItemTitle}>{element.title}</h4>
          {element.description && (
            <p className={megaMenuColumnItemDescription}>
              {element.description}
            </p>
          )}
        </div>
      </>
    ),
    [element.description, element.img, element.title]
  );

  return element.path ? (
    <div className={megaMenuColumnItem}>
      <a href={element.path} className={megaMenuColumnItemContentContainer}>
        {htmlElement}
      </a>
    </div>
  ) : (
    <div
      className={megaMenuColumnItem}
      onClick={() => {
        element.action?.();
      }}
    >
      <button className={megaMenuColumnItemButton}>{htmlElement}</button>
    </div>
  );
};
