import type { Meta, StoryObj } from '@storybook/react';

import { OtherSimilarRessources } from '.';

const meta: Meta<typeof OtherSimilarRessources> = {
  title: 'Components/OtherSimilarRessources',
  component: OtherSimilarRessources,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OtherSimilarRessources>;

export const Primary: Story = {
  args: {},
};
