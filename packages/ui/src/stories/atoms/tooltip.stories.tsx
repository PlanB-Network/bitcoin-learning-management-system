import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from '../../atoms/tooltip.tsx';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Primary: Story = {
  args: {},
};
