import type { Meta, StoryObj } from '@storybook/react';

import { Anchor } from '../../atoms/anchor.tsx';

const meta: Meta<typeof Anchor> = {
  component: Anchor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Anchor>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
  },
};
