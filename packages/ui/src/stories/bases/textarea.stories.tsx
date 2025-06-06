import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from '../../bases/textarea.js';

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  title: 'Bases/Form/textarea',
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
