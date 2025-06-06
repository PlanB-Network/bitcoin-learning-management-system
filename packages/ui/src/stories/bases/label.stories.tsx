import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../../bases/label.js';

const meta: Meta<typeof Label> = {
  component: Label,
  title: 'Bases/Form/label',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Primary: Story = {
  args: { children: 'Label content' },
};
