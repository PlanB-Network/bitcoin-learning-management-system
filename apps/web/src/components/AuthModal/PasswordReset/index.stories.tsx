import type { Meta, StoryObj } from '@storybook/react';

import { PasswordReset } from '.';

const meta: Meta<typeof PasswordReset> = {
  title: 'Components/PasswordReset',
  component: PasswordReset,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PasswordReset>;

export const Primary: Story = {
  args: {},
};
