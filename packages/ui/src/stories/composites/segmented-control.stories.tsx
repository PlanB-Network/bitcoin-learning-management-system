import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '#src/composites/segmented-control.tsx';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Composites/segmented-control',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    value: {
      control: false,
    },
    defaultValue: {
      control: false,
    },
    onValueChange: {
      table: { disable: true },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    defaultValue: 'one',
  },
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="one">One</SegmentedControlItem>
      <SegmentedControlItem value="two">Two</SegmentedControlItem>
      <SegmentedControlItem value="three">Three</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Controlled: Story = {
  args: {
    variant: 'default',
    size: 'default',
    value: 'a',
  },
  render: (args) => {
    const [value, setValue] = useState('a');

    return (
      <SegmentedControl
        {...args}
        value={value}
        onValueChange={(val) => setValue(val)}
      >
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
        <SegmentedControlItem value="c">C</SegmentedControlItem>
      </SegmentedControl>
    );
  },
};

export const Small: Story = {
  args: {
    variant: 'default',
    size: 'sm',
    defaultValue: 'left',
  },
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="left">Left</SegmentedControlItem>
      <SegmentedControlItem value="center">Center</SegmentedControlItem>
      <SegmentedControlItem value="right">Right</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const OutlineVariant: Story = {
  args: {
    variant: 'outline',
    size: 'default',
    defaultValue: 'alpha',
  },
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="alpha">Alpha</SegmentedControlItem>
      <SegmentedControlItem value="beta">Beta</SegmentedControlItem>
    </SegmentedControl>
  ),
};
