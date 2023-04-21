import { style } from '@vanilla-extract/css';

export const createdAccountIcon = style([
  'pi',
  'pi-check',
  { color: 'green', fontSize: '2.5rem', margin: '2rem 0' },
]);

export const createdAccountContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
