import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from './index.tsx';

const meta: Meta<typeof Tag> = {
  title: 'Atoms/Tag',
  component: Tag,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Primary: Story = {
  args: {},
};
