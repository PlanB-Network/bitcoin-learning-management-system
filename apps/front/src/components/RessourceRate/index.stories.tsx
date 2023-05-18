import type { Meta, StoryObj } from '@storybook/react';

import { RessourceRate } from '.';

const meta: Meta<typeof RessourceRate> = {
  title: 'Components/RessourceRate',
  component: RessourceRate,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RessourceRate>;

export const Primary: Story = {
  args: {},
};
