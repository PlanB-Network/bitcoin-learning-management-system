import type { Meta, StoryObj } from '@storybook/react';

import { OtherSimilarResources } from '.';

const meta: Meta<typeof OtherSimilarResources> = {
  title: 'Components/OtherSimilarResources',
  component: OtherSimilarResources,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OtherSimilarResources>;

export const Primary: Story = {
  args: {},
};
