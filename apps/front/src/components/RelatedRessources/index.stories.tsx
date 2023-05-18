import type { Meta, StoryObj } from '@storybook/react';

import { RelatedRessources } from '.';

const meta: Meta<typeof RelatedRessources> = {
  title: 'Components/RelatedRessources',
  component: RelatedRessources,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RelatedRessources>;

export const Primary: Story = {
  args: {},
};
