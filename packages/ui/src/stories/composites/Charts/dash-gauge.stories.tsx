import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashGauge } from '#src/composites/Chart/radial-gauge.js';

const meta: Meta<typeof DashGauge> = {
  title: 'Composites/Charts/dash-gauge',
  component: DashGauge,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label displayed below the gauge',
    },
    completed: {
      control: 'number',
      description: 'The number of completed items',
    },
    total: {
      control: 'number',
      description: 'The total number of items',
    },
    variant: {
      control: 'select',
      options: ['green', 'purple', 'yellow', 'orange'],
      description: 'Color variant for the gauge',
    },
    size: {
      control: 'select',
      options: ['m', 'l'],
      description: 'Size of the gauge',
    },
    showBackground: {
      control: 'boolean',
      description: 'Whether to show the background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DashGauge>;

export const Default: Story = {
  name: 'Default',
  args: {
    label: 'Progress',
    completed: 15,
    total: 20,
    variant: 'green',
    size: 'm',
    showBackground: true,
  },
};

export const LargeSize: Story = {
  name: 'Large size',
  args: {
    label: 'Course progress',
    completed: 46,
    total: 100,
    variant: 'purple',
    size: 'l',
    showBackground: true,
  },
};

export const NoBackground: Story = {
  name: 'No background',
  args: {
    label: 'Tasks complete',
    completed: 8,
    total: 12,
    variant: 'orange',
    size: 'm',
    showBackground: false,
  },
};
