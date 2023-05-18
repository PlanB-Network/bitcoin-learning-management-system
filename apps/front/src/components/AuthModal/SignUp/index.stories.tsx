import type { Meta, StoryObj } from '@storybook/react';

import { SignUp } from '.';

const meta: Meta<typeof SignUp> = {
  title: 'Components/SignUp',
  component: SignUp,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SignUp>;

export const Primary: Story = {
  args: {},
};
