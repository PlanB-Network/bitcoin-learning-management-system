import type { Meta, StoryObj } from '@storybook/react';

import { Label } from '../../atoms/label.tsx';

const meta: Meta<typeof Label> = {
  component: Label,
  title: 'Stories/form/label',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Primary: Story = {
  args: { children: 'Label content' },
};
