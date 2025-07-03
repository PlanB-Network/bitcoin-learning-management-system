import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from '#src/bases/slider.tsx';

const meta: Meta<typeof Slider> = {
  component: Slider,
  tags: ['autodocs'],
  title: 'Bases/Form/slider',
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Primary: Story = {
  args: {
    defaultValue: [1],
    max: 2,
    min: -2,
    step: 1,
    value: [1],
  },
};
