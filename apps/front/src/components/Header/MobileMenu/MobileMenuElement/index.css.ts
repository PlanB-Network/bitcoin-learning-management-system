import { style } from '@vanilla-extract/css';

import { menuLinkElement } from '../../index.css';
import { mobileMenuButton } from '../index.css';

export const mobileMenuElementContent = style([
  menuLinkElement,
  {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
]);

export const mobileMenuElementButton = style([
  mobileMenuElementContent,
  mobileMenuButton,
  {
    padding: '20px 20px 20px 60px',
  },
]);

export const elementTitle = style({ margin: 0 });

export const mobileMenuImage = style({ width: '30px', marginRight: 8 });

export const mobileMenuItemTitle = style({
  fontSize: '12px',
  display: 'block',
  margin: '6px 0',
});

export const mobileMenuItemDescription = style({
  fontSize: '11px',
  margin: 0,
  maxWidth: '400px',
});
