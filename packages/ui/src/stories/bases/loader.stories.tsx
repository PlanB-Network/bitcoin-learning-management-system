import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from '#src/bases/loader.js';

const meta: Meta<typeof Loader> = {
  argTypes: {
    className: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['s', 'm', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['black', 'orange'],
    },
  },
  component: Loader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/loader',
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    size: 'm',
    variant: 'orange',
  },
};

export const SmallBlackLoader: Story = {
  args: {
    size: 's',
    variant: 'black',
  },
  name: 'Small Black Loader',
};

export const LargeOrangeLoader: Story = {
  args: {
    size: 'xl',
    variant: 'orange',
  },
  name: 'Large Orange Loader',
};
