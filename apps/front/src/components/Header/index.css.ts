import { style } from '@vanilla-extract/css';

export const headerStyle = style({
  position: 'fixed',
  zIndex: 20,
  top: 0,
  left: 0,
  width: '100vw',
  padding: '10px 0',
  background: 'var(--primary-color)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

export const headerSideImageStyle = style({
  height: 40,
  position: 'absolute',
  left: 30,
});

export const headerExpandedImageStyle = style({
  transition: '0.6s',
  height: 40,
  '@media': {
    'screen and (min-width: 768px)': {
      height: 60,
    },
    'screen and (min-width: 1000px)': {
      height: 80,
    },
  },
});

export const headerShrinkedImageStyle = style({
  transition: '0.6s',
  height: 0,
});

export const headerMenuStyle = style({
  transition: '0.6s',
  background: 'transparent',
  color: 'var(--text-secondary-color)',
  border: 'none',
});

