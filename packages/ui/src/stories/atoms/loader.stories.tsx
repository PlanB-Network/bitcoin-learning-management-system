import type { Meta, StoryObj } from '@storybook/react';

import { Loader } from '../../atoms/loader.tsx';

const meta: Meta<typeof Loader> = {
  component: Loader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Primary: Story = {
  args: {},
};
