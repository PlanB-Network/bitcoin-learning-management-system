import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { NavigationElement } from '../../props';

import {
  mobileMenuElementButton,
  mobileMenuElementContent,
  mobileMenuImage,
  mobileMenuItemDescription,
  mobileMenuItemTitle,
} from './index.css';

export interface MobileMenuElementProps {
  element: NavigationElement;
}

export const MobileMenuElement = ({ element }: MobileMenuElementProps) => {
  const htmlElement = useMemo(
    () => (
      <>
        {element.img && (
          <img
            className={mobileMenuImage}
            src={element.img}
            alt="library icon"
          />
        )}
        <div>
          <h4 className={mobileMenuItemTitle}>{element.title}</h4>
          {element.description && (
            <p className={mobileMenuItemDescription}>{element.description}</p>
          )}
        </div>
      </>
    ),
    [element.description, element.img, element.title]
  );

  return 'path' in element ? (
    <div>
      <Link className={mobileMenuElementContent} to={element.path}>
        {htmlElement}
      </Link>
    </div>
  ) : (
    <div
      onClick={() => {
        element.action();
      }}
    >
      <button className={mobileMenuElementButton}>{htmlElement}</button>
    </div>
  );
};
