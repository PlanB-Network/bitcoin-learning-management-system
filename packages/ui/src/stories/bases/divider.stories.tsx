import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider, DividerSimple, DividerVertical } from '#src/bases/divider.js';

const meta: Meta<typeof Divider> = {
  argTypes: {
    children: {
      control: 'text',
      description: 'Optional text to display in the middle of the divider',
    },
    className: {
      control: 'text',
    },
    mode: {
      control: 'select',
      options: ['dark', 'light'],
    },
    width: {
      control: 'text',
      description:
        'CSS width tailwind class for the divider (e.g. "w-4/5", "w-full")',
    },
  },
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/divider',
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const DefaultHorizontalDivider: Story = {
  args: {
    mode: 'dark',
    width: 'w-full',
  },
  name: 'Horizontal Divider (Default)',
  render: (args) => (
    <div className="w-[400px]">
      <Divider {...args} />
    </div>
  ),
};

export const HorizontalDividerLightMode: Story = {
  args: {
    mode: 'light',
    width: 'w-full',
  },
  name: 'Horizontal Divider (Light Mode)',
  render: (args) => (
    <div className="w-[400px]">
      <Divider {...args} />
    </div>
  ),
};

export const HorizontalDividerWithText: Story = {
  args: {
    children: 'OR',
    mode: 'dark',
    width: 'w-full',
  },
  name: 'Horizontal Divider with Text',
  render: (args) => (
    <div className="w-[400px]">
      <Divider {...args} />
    </div>
  ),
};

export const SimpleHorizontalDivider: StoryObj<typeof DividerSimple> = {
  args: {
    className: 'my-4',
    mode: 'dark',
  },
  argTypes: {
    className: {
      control: 'text',
    },
    mode: {
      control: 'select',
      options: ['dark', 'light'],
    },
  },
  name: 'Simple Horizontal Line',
  render: (args) => (
    <div className="w-[400px] p-4">
      <p className="mb-2">Content above</p>
      <DividerSimple {...args} />
      <p className="mt-2">Content below</p>
    </div>
  ),
};

export const VerticalDivider: StoryObj<typeof DividerVertical> = {
  args: {
    mode: 'dark',
  },
  argTypes: {
    className: {
      control: 'text',
    },
    mode: {
      control: 'select',
      options: ['dark', 'light'],
    },
  },
  name: 'Vertical Divider',
  render: (args) => (
    <div className="flex h-40 items-center justify-center">
      <span>Left Content</span>
      <DividerVertical {...args} className="h-full mx-4" />
      <span>Right Content</span>
    </div>
  ),
};
