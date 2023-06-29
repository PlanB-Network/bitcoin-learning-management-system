import type { Meta, StoryObj } from '@storybook/react';

import { RelatedResources } from '.';

const meta: Meta<typeof RelatedResources> = {
  title: 'Components/Resources/RelatedResources',
  component: RelatedResources,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RelatedResources>;

export const Primary: Story = {
  args: {},
};
