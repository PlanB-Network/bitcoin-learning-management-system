import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from './index.tsx';

const meta: Meta<typeof TextInput> = {
  title: 'Atoms/TextInput',
  component: TextInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Primary: Story = {
  args: {},
};
