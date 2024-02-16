import type { Meta, StoryObj } from '@storybook/react';

import { Header } from './index.tsx';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Primary: Story = {
  args: {},
};
