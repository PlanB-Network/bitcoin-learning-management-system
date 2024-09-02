import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from '../../atoms/textarea.tsx';

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Primary: Story = {
  args: {
    placeholder: 'Placeholder',
    rows: 3,
    className:
      'w-full rounded-md px-4 py-1 text-gray-400 border border-gray-400/6',
  },
};
