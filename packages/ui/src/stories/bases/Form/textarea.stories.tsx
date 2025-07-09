import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from '#src/bases/textarea.js';

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  tags: ['autodocs'],
  title: 'Bases/Form/textarea',
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Primary: Story = {
  args: {
    placeholder: 'Placeholder',
    rows: 3,
  },
};
