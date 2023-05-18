import type { Meta, StoryObj } from '@storybook/react';

import { RessourceReview } from '.';

const meta: Meta<typeof RessourceReview> = {
  title: 'Components/RessourceReview',
  component: RessourceReview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RessourceReview>;

export const Primary: Story = {
  args: {},
};
