import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { NavigationElement } from '../../props';
import {
  megaMenuColumnItem,
  megaMenuColumnItemButton,
  megaMenuColumnItemContentContainer,
  megaMenuColumnItemDescription,
  megaMenuColumnItemTextContent,
  megaMenuColumnItemTitle,
  megaMenuImage,
} from '../index.css';

export interface MegaMenuElementProps {
  element: NavigationElement;
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

  return 'path' in element ? (
    <div className={megaMenuColumnItem}>
      <Link to={element.path} className={megaMenuColumnItemContentContainer}>
        {htmlElement}
      </Link>
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
