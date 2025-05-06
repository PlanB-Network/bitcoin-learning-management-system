import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from './App.tsx';

describe('App', () => {
  test('renders', () => {
    render(<App />);
    expect(screen.getByText('Learn React')).toBeDefined();
  });
});
