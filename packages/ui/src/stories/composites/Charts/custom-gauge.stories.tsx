import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomGauge } from '#src/composites/Chart/radial-gauge.js';

const meta: Meta<typeof CustomGauge> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
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
    type: {
      control: 'select',
      description: 'Type of gauge image',
      options: ['clock', 'star'],
    },
    value: {
      control: 'text',
      description: 'The value displayed in the gauge',
    },
    variant: {
      control: 'select',
      description: 'Color variant for the gauge',
      options: ['blue'],
    },
  },
  component: CustomGauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Charts/custom-gauge',
};

export default meta;

type Story = StoryObj<typeof CustomGauge>;

export const ClockDefault: Story = {
  args: {
    label: 'Duration',
    showBackground: true,
    size: 'm',
    type: 'clock',
    value: `2'30"`,
    variant: 'blue',
  },
  name: 'Clock default',
};

export const StarDefault: Story = {
  args: {
    label: 'Rating',
    showBackground: true,
    size: 'm',
    type: 'star',
    value: '4.8',
    variant: 'blue',
  },
  name: 'Star default',
};

export const StarLarge: Story = {
  args: {
    label: 'Ranking',
    showBackground: true,
    size: 'l',
    type: 'star',
    value: '4',
    variant: 'blue',
  },
  name: 'Star large',
};

export const NoBackground: Story = {
  args: {
    label: 'Study time',
    showBackground: false,
    size: 'm',
    type: 'clock',
    value: '1h45m',
    variant: 'blue',
  },
  name: 'No background',
};
