import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '../../atoms/text-input.tsx';

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Primary: Story = {
  args: {},
};
