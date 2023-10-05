import type { Meta, StoryObj } from '@storybook/react';

import { FlyingMenuSubSection } from '.';

const meta: Meta<typeof FlyingMenuSubSection> = {
  title: 'Components/FlyingMenuSubSection',
  component: FlyingMenuSubSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlyingMenuSubSection>;

export const Primary: Story = {
  args: {},
};
