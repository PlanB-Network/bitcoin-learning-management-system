import { style } from '@vanilla-extract/css';

import { mobileMenuButton } from '../index.css';

export const menuSubSectionButton = style([
  mobileMenuButton,
  {
    padding: '20px 20px 20px 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
]);

export const menuSubSectionListItem = style({
  height: 'max-content',
  overflow: 'hidden',
});

export const menuSubSectionListItemsContent = style({
  height: 'max-content',
  overflow: 'hidden',
  transition: '0.3s',
});
