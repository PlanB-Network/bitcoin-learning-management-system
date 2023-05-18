import type { Meta, StoryObj } from '@storybook/react';

import { ErrorMessage } from '.';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Primary: Story = {
  args: {},
};
