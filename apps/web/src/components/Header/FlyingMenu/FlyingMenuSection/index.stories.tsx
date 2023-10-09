import type { Meta, StoryObj } from '@storybook/react';

import { FlyingMenuSection } from '.';

const meta: Meta<typeof FlyingMenuSection> = {
  title: 'Components/FlyingMenuSection',
  component: FlyingMenuSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlyingMenuSection>;

export const Primary: Story = {
  args: {},
};
