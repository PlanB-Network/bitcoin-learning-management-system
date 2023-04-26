import { style } from '@vanilla-extract/css';

export const navContainer = style({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'var(--surface-50)',
  position: 'fixed',
  top: 0,
  left: 0,
  transition: '0.3s',

  display: 'flex',
  flexDirection: 'column',

  padding: '80px 10px 20px',
});

export const menuIcon = style({
  zIndex: 40,
  position: 'absolute',
  left: '4vw',
  transition: 'transform 0.4s, color 0.2s',
  cursor: 'pointer',
});

export const listContainer = style({
  paddingLeft: 0,
  marginTop: 0,
  marginBottom: 0,
  listStyle: 'none',
  flex: 1,
  overflow: 'scroll',
});

export const listElement = style({
  listStyle: 'none',
  paddingLeft: '0',
  marginLeft: 0,
});

export const mobileMenuButton = style({
  border: '1px solid var(--surface-100)',
  borderRadius: '6px',

  color: 'var(--text-color)',

  margin: '5px 0',
  padding: '20px',
  width: '100%',
  textAlign: 'left',

  transition: '0.4s',

  cursor: 'pointer',

  ':hover': {
    borderColor: 'var(--surface-500)',
  },
});

export const arrowIcon = style({
  transition: '0.3s',
  width: '20px',
  height: '20px',
  margin: 0,
  padding: 0,
});
