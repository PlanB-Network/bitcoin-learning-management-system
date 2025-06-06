import type { Meta, StoryObj } from '@storybook/react-vite';

import { Slider } from '../../bases/slider.js';

const meta: Meta<typeof Slider> = {
  component: Slider,
  title: 'Bases/Form/slider',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Primary: Story = {
  args: {
    min: -2,
    max: 2,
    step: 1,
    defaultValue: [1],
    value: [1],
  },
};
