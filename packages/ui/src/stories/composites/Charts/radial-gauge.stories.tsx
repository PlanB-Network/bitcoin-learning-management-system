import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadialGauge } from '#src/composites/Chart/radial-gauge.js';

const meta: Meta<typeof RadialGauge> = {
  title: 'Composites/Charts/radial-gauge',
  component: RadialGauge,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label displayed below the gauge',
    },
    percentage: {
      control: 'number',
      description: 'The percentage value to display (0-100)',
    },
    variant: {
      control: 'select',
      options: ['green', 'purple', 'yellow', 'orange'],
      description: 'Color variant for the gauge',
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

type Story = StoryObj<typeof RadialGauge>;

export const Default: Story = {
  name: 'Default',
  args: {
    label: 'Average score',
    percentage: 86,
    variant: 'green',
    showBackground: true,
  },
};
