import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  render: (properties) => <Button {...properties}>Button</Button>,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Base: Story = {
  args: {},
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
  },
};
