import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './index.tsx';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {},
};
