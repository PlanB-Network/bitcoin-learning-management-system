import { style } from '@vanilla-extract/css';

export const navContainer = style({
  fontSize: 0,
});

export const listContainer = style({
  paddingLeft: 0,
  marginTop: 0,
  marginBottom: 0,
  listStyle: 'none',
});

export const listElementContainer = style({
  display: 'inline-block',
  fontSize: '14px',
  padding: '0 15px',
});

export const listElementTitle = style({
  color: '#fff',
  display: 'block',
  padding: '20px 0',
  border: 'none',
  margin: 0,
  background: 'none',
  borderBottom: '3px solid transparent',
  transition: 'all .3s ease',
  selectors: {
    [`${listElementContainer}:hover &`]: {
      color: 'var(--text-color-secondary)',
      borderBottom: '3px solid var(--text-color-secondary)',
    },
  },
});

export const dropDown = style({});

export const firstLevelListItem = style([dropDown, listElementContainer]);

export const megaMenu = style({
  position: 'absolute',
  left: '50vw',
  width: 'max-content',

  padding: '20px',

  borderRadius: '4px',

  background: 'var(--surface-50)',
  boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',

  transition: 'visibility 0s, opacity 0.2s linear',
  transform: 'translateX(-50%)',
  visibility: 'hidden',
  opacity: 0,

  selectors: {
    [`${dropDown}:hover &`]: {
      visibility: 'visible',
      opacity: 1,
    },
  },
});

export const megaMenuContainer = style([
  listElementContainer,
  {
    display: 'flex',
  },
]);

export const megaMenuItem = style({
  flexGrow: 1,
  margin: '0 10px',
});

export const megaMenuImage = style({ width: '40px', marginRight: '25px' });

export const megaMenuTitle = style({ color: '#444' });

export const megaMenuColumns = style({ display: 'flex', flexDirection: 'row' });

export const megaMenuColumn = style([
  listContainer,
  { width: 'max-content', margin: '0 20px' },
]);

export const megaMenuColumnItem = style({
  border: '1px solid var(--surface-100)',
  borderRadius: '6px',

  color: 'var(--text-color)',

  margin: '8px',
  padding: '8px 16px',

  transition: '0.4s',

  cursor: 'pointer',

  ':hover': {
    borderColor: 'var(--surface-500)',
  },
});

export const megaMenuColumnItemContentContainer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',

  cursor: 'pointer',
  textAlign: 'left',
});

export const megaMenuColumnItemTextContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'right',
});

export const megaMenuColumnItemTitle = style({
  fontSize: '16px',
  display: 'block',
  margin: '6px 0',
});

export const megaMenuColumnItemDescription = style({
  fontSize: '12px',
  margin: 0,
  maxWidth: '400px',
});

export const megaMenuColumnItemButton = style([
  megaMenuColumnItemContentContainer,
  {
    padding: 0,
    margin: 0,
    background: 'none',
    border: 'none',
  },
]);
