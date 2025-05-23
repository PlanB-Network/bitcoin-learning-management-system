import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from '../../atoms/textarea.tsx';

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  title: 'Stories/form/textarea',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Primary: Story = {
  args: {
    placeholder: 'Placeholder',
    rows: 3,
  },
};
