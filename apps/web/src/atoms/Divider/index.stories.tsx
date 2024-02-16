import type { Meta, StoryObj } from '@storybook/react';

import { Divider } from './index.tsx';

const meta: Meta<typeof Divider> = {
  title: 'Atoms/Divider',
  component: Divider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Primary: Story = {
  args: {},
};
