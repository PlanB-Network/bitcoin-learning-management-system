import type { Meta, StoryObj } from '@storybook/react';
import {
  Divider,
  DividerSimple,
  DividerVertical,
} from '../../atoms/divider.tsx';

const meta: Meta<typeof Divider> = {
  title: 'Atoms/divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Optional text to display in the middle of the divider',
    },
    width: {
      control: 'text',
      description:
        'CSS width tailwind class for the divider (e.g. "w-4/5", "w-full")',
    },
    className: {
      control: 'text',
    },
    mode: {
      control: 'select',
      options: ['dark', 'light'],
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const DefaultHorizontalDivider: Story = {
  name: 'Horizontal Divider (Default)',
  args: {
    mode: 'dark',
    width: 'w-full',
  },
  render: (args) => (
    <div className="w-[400px]">
      <Divider {...args} />
    </div>
  ),
};

export const HorizontalDividerLightMode: Story = {
  name: 'Horizontal Divider (Light Mode)',
  args: {
    mode: 'light',
    width: 'w-full',
  },
  render: (args) => (
    <div className="w-[400px]">
      <Divider {...args} />
    </div>
  ),
};

export const HorizontalDividerWithText: Story = {
  name: 'Horizontal Divider with Text',
  args: {
    children: 'OR',
    mode: 'dark',
    width: 'w-full',
  },
  render: (args) => (
    <div className="w-[400px]">
      <Divider {...args} />
    </div>
  ),
};

export const SimpleHorizontalDivider: StoryObj<typeof DividerSimple> = {
  name: 'Simple Horizontal Line',
  render: (args) => (
    <div className="w-[400px] p-4">
      <p className="mb-2">Content above</p>
      <DividerSimple {...args} />
      <p className="mt-2">Content below</p>
    </div>
  ),
  args: {
    mode: 'dark',
    className: 'my-4',
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['dark', 'light'],
    },
    className: {
      control: 'text',
    },
  },
};

export const VerticalDivider: StoryObj<typeof DividerVertical> = {
  name: 'Vertical Divider',
  render: (args) => (
    <div className="flex h-40 items-center justify-center">
      <span>Left Content</span>
      <DividerVertical {...args} className="h-full mx-4" />
      <span>Right Content</span>
    </div>
  ),
  args: {
    mode: 'dark',
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['dark', 'light'],
    },
    className: {
      control: 'text',
    },
  },
};
