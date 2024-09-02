import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '../../atoms/text-input.tsx';

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  title: 'Stories/form/textinput(deprecated)',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Primary: Story = {
  args: {
    labelText: 'Label',
    placeholder: 'Placeholder',
    cornerHint: 'Corner hint',
    mandatory: true,
    error: 'Error ',
  },
};
