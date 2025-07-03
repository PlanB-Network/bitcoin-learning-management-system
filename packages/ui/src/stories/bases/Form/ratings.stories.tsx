import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ratings } from '#src/bases/ratings.tsx';

const meta: Meta<typeof Ratings> = {
  component: Ratings,
  tags: ['autodocs'],
  title: 'Bases/Form/ratings',
};

export default meta;
type Story = StoryObj<typeof Ratings>;

export const Primary: Story = {
  args: {
    id: 'general',
    totalStars: 5,
    value: 3,
    variant: 'yellow',
  },
};
