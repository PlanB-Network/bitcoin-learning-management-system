import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from '../../bases/loader.js';

const meta: Meta<typeof Loader> = {
  title: 'Bases/loader',
  component: Loader,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['black', 'orange'],
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'xl'],
    },
    className: {
      control: 'text',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    variant: 'orange',
    size: 'm',
  },
};

export const SmallBlackLoader: Story = {
  name: 'Small Black Loader',
  args: {
    variant: 'black',
    size: 's',
  },
};

export const LargeOrangeLoader: Story = {
  name: 'Large Orange Loader',
  args: {
    variant: 'orange',
    size: 'xl',
  },
};
