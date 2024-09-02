import type { Meta, StoryObj } from '@storybook/react';

import { Slider } from '../../atoms/slider.tsx';

const meta: Meta<typeof Slider> = {
  component: Slider,
  title: 'Stories/form/slider',
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
