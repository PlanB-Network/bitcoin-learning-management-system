import { style } from '@vanilla-extract/css';

export const errorMessage = style({
  color: '#f51d00',
  width: '250px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'none',
});
