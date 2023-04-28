import { style } from '@vanilla-extract/css';

export const title = style({
  textTransform: 'uppercase',
  fontSize: 60,
  fontFamily: 'Poppins',
  fontWeight: 600,
  color: 'var(--primary-color)',
  borderBottom: '6px solid var(--primary-color)',
  width: '40rem',
  marginLeft: 90,
  lineHeight: 1.3,
});

export const contentContainer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-evenly',
  margin: '3rem',
});

export const textualContainer = style({
  display: 'flex',
  flexDirection: 'column',
  marginRight: '3rem',
});

export const companyImageContent = style({
  width: '15rem',
  height: 'auto',
  margin: '1rem 3rem',
});

export const companyText = style({ textAlign: 'justify', maxWidth: '40rem' });
