import type { Meta, StoryObj } from '@storybook/react';

import { Input } from '../../atoms/input.tsx';

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'Stories/form/input',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {
    placeholder: 'Placeholder',
  },
};
