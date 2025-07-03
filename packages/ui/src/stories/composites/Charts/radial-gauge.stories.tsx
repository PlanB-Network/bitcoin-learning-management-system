import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadialGauge } from '#src/composites/Chart/radial-gauge.js';

const meta: Meta<typeof RadialGauge> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
    filledColorTransparent: {
      control: 'boolean',
      description: 'Whether the filled color should be transparent',
    },
    label: {
      control: 'text',
      description: 'The label displayed below the gauge',
    },
    percentage: {
      control: 'number',
      description: 'The percentage value to display (0-100)',
    },
    showBackground: {
      control: 'boolean',
      description: 'Whether to show the background',
    },
    variant: {
      control: 'select',
      description: 'Color variant for the gauge',
      options: ['green', 'purple', 'yellow', 'orange'],
    },
  },
  component: RadialGauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Charts/radial-gauge',
};

export default meta;

type Story = StoryObj<typeof RadialGauge>;

export const Default: Story = {
  args: {
    filledColorTransparent: false,
    label: 'Average score',
    percentage: 86,
    showBackground: true,
    variant: 'green',
  },
  name: 'Default',
};

export const TransparentFilled: Story = {
  args: {
    filledColorTransparent: true,
    label: 'Average score',
    percentage: 86,
    showBackground: true,
    variant: 'green',
  },
  name: 'Transparent Filled',
};
