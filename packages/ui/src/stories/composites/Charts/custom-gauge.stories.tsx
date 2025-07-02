import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomGauge } from '#src/composites/Chart/radial-gauge.js';

const meta: Meta<typeof CustomGauge> = {
  title: 'Composites/Charts/custom-gauge',
  component: CustomGauge,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label displayed below the gauge',
    },
    value: {
      control: 'text',
      description: 'The value displayed in the gauge',
    },
    variant: {
      control: 'select',
      options: ['blue'],
      description: 'Color variant for the gauge',
    },
    type: {
      control: 'select',
      options: ['clock', 'star'],
      description: 'Type of gauge image',
    },
    showBackground: {
      control: 'boolean',
      description: 'Whether to show the background',
    },
    size: {
      control: 'select',
      options: ['m', 'l'],
      description: 'Size of the gauge',
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

type Story = StoryObj<typeof CustomGauge>;

export const ClockDefault: Story = {
  name: 'Clock default',
  args: {
    label: 'Duration',
    value: `2'30"`,
    variant: 'blue',
    type: 'clock',
    size: 'm',
    showBackground: true,
  },
};

export const StarDefault: Story = {
  name: 'Star default',
  args: {
    label: 'Rating',
    value: '4.8',
    variant: 'blue',
    type: 'star',
    size: 'm',
    showBackground: true,
  },
};

export const StarLarge: Story = {
  name: 'Star large',
  args: {
    label: 'Ranking',
    value: '4',
    variant: 'blue',
    type: 'star',
    size: 'l',
    showBackground: true,
  },
};

export const NoBackground: Story = {
  name: 'No background',
  args: {
    label: 'Study time',
    value: '1h45m',
    variant: 'blue',
    type: 'clock',
    size: 'm',
    showBackground: false,
  },
};
