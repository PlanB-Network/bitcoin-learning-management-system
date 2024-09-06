import type { Meta, StoryObj } from '@storybook/react';

import { Register } from './index.tsx';

const meta: Meta<typeof Register> = {
  title: 'Components/Register',
  component: Register,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Register>;

export const Primary: Story = {
  args: {},
};
