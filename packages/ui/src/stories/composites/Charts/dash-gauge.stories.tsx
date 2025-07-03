import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashGauge } from '#src/composites/Chart/radial-gauge.js';

const meta: Meta<typeof DashGauge> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
    completed: {
      control: 'number',
      description: 'The number of completed items',
    },
    label: {
      control: 'text',
      description: 'The label displayed below the gauge',
    },
    showBackground: {
      control: 'boolean',
      description: 'Whether to show the background',
    },
    size: {
      control: 'select',
      description: 'Size of the gauge',
      options: ['m', 'l'],
    },
    total: {
      control: 'number',
      description: 'The total number of items',
    },
    variant: {
      control: 'select',
      description: 'Color variant for the gauge',
      options: ['green', 'purple', 'yellow', 'orange'],
    },
  },
  component: DashGauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Charts/dash-gauge',
};

export default meta;

type Story = StoryObj<typeof DashGauge>;

export const Default: Story = {
  args: {
    completed: 15,
    label: 'Progress',
    showBackground: true,
    size: 'm',
    total: 20,
    variant: 'green',
  },
  name: 'Default',
};

export const LargeSize: Story = {
  args: {
    completed: 46,
    label: 'Course progress',
    showBackground: true,
    size: 'l',
    total: 100,
    variant: 'purple',
  },
  name: 'Large size',
};

export const NoBackground: Story = {
  args: {
    completed: 8,
    label: 'Tasks complete',
    showBackground: false,
    size: 'm',
    total: 12,
    variant: 'orange',
  },
  name: 'No background',
};
