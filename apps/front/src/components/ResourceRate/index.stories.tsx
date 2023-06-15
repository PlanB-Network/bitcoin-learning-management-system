import type { Meta, StoryObj } from '@storybook/react';

import { ResourceRate } from '.';

const meta: Meta<typeof ResourceRate> = {
  title: 'Components/ResourceRate',
  component: ResourceRate,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResourceRate>;

export const Primary: Story = {
  args: {},
};
