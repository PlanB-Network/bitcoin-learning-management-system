import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../atoms/button.tsx';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered',
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
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

export const Tertiary: Story = {
  args: {
    children: 'tertiary',
    size: 'l',
    variant: 'tertiary',
  },
};

export const PrimaryGhost: Story = {
  args: {
    children: 'primaryGhost',
    size: 'l',
    variant: 'primaryGhost',
  },
};

export const Ghost: Story = {
  args: {
    children: 'ghost',
    size: 'l',
    variant: 'ghost',
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

export const FakeDisabledPrimary: Story = {
  args: {
    children: 'FakeDisabled',
    fakeDisabled: true,
    size: 'l',
    variant: 'primary',
  },
};

export const OnHoverArrow: Story = {
  args: {
    children: 'OnHoverArrow',
    onHoverArrow: true,
    size: 'l',
    variant: 'primary',
  },
};
