import { style } from '@vanilla-extract/css';

export const heroSection = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  width: '100%',
  color: 'var(--text-color)',
  paddingTop: '100px',
  background: 'var(--surface-100)',
  height: '100vh',
});

export const textualSection = style({});

export const textTitle = style({
  fontSize: '50px',
});

export const textParagraph = style({
  maxWidth: '500px',
  fontWeight: 200,
  fontSize: 17,
});

export const heroSectionCtaContainer = style({
  marginTop: '50px',
  display: 'flex',
  flexDirection: 'column',
});

export const heroSectionCtaButton = style({
  marginTop: 10,
});

export const imageSection = style({});

export const image = style({ height: '400px' });

export const coursesSection = style({ background: 'var(--surface-0)' });

export const courseTitle = style({
  width: 'max-content',
  margin: '30px auto',
  fontSize: 34,
  color: 'var(--text-color)',
});

export const courseContainer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px 0',
});

export const startButton = style({
  fontFamily: 'SpaceMono',
});
