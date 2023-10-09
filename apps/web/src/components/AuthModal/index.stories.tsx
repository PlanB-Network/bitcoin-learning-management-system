import type { Meta, StoryObj } from '@storybook/react';

import { AuthModal } from '.';

const meta: Meta<typeof AuthModal> = {
  title: 'Components/AuthModal',
  component: AuthModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuthModal>;

export const Primary: Story = {
  args: {},
};
