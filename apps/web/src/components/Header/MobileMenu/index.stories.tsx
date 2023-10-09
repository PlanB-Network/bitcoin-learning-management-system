import type { Meta, StoryObj } from '@storybook/react';

import { MobileMenu } from '.';

const meta: Meta<typeof MobileMenu> = {
  title: 'Components/MobileMenu',
  component: MobileMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileMenu>;

export const Primary: Story = {
  args: {},
};
