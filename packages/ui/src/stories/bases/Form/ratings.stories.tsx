import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ratings } from '#src/bases/ratings.tsx';

const meta: Meta<typeof Ratings> = {
  component: Ratings,
  title: 'Bases/Form/ratings',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Ratings>;

export const Primary: Story = {
  args: {
    id: 'general',
    variant: 'yellow',
    totalStars: 5,
    value: 3,
  },
};
