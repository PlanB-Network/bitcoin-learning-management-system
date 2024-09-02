import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../atoms/button.tsx';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F2F2F2' },
        { name: 'dark', value: '#333333' },
      ],
    },
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    disabled: {
      control: 'boolean', // This enables a toggle control in the Storybook UI
      description: 'Disable the button',
      defaultValue: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'primary',
    size: 'm',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'secondary',
    size: 'l',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'outline',
    size: 'l',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'ghost',
    size: 'l',
    variant: 'ghost',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const GlowingPrimary: Story = {
  args: {
    children: 'Glowing',
    glowing: true,
    size: 'l',
    variant: 'primary',
  },
};

export const RoundedPrimary: Story = {
  args: {
    children: 'Rounded',
    rounded: true,
    size: 'l',
    variant: 'primary',
  },
};
