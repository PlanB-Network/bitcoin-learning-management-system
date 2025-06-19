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
    size: {
      control: 'number',
      description: 'The diameter of the gauge in pixels',
    },
    variant: {
      control: 'select',
      options: ['green'],
      description: 'Color variant for the gauge',
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
    size: 124,
  },
};
