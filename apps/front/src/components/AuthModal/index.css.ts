import { style } from '@vanilla-extract/css';

export const dialogContainer = style({
  position: 'relative',
  width: '400px',
  padding: '0',
});

export const dialogContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const loginWithLNButton = style({ margin: '20px 0' });

export const signinForm = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const inputContainer = style(['p-float-label', { marginTop: '30px' }]);

export const inputStyle = style([{ width: '253px' }]);

export const submitButton = style({ marginTop: '40px', marginBottom: '20px' });

export const createAccountText = style({ marginBottom: 0, fontSize: 12 });

export const switchButton = style({
  border: 'none',
  background: 'none',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: 12,
});

export const errorMessage = style({ color: '#f51d00' });
