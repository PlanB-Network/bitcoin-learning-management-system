import type { Meta, StoryObj } from '@storybook/react';

import { ResourceReview } from '.';

const meta: Meta<typeof ResourceReview> = {
  title: 'Components/ResourceReview',
  component: ResourceReview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResourceReview>;

export const Primary: Story = {
  args: {},
};
