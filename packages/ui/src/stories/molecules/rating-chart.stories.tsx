import type { Meta, StoryObj } from '@storybook/react-vite';
import { RatingChart } from '#src/molecules/Chart/rating-chart.tsx';

const meta: Meta<typeof RatingChart> = {
  title: 'Molecules/rating-chart',
  component: RatingChart,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {
    chartData: {
      description: 'Array of objects containing chart data',
    },
  },
};

export default meta;

type Story = StoryObj<typeof RatingChart>;

const starRatingData = [
  { star: '1 star', count: 35 },
  { star: '2 stars', count: 12 },
  { star: '3 stars', count: 15 },
  { star: '4 stars', count: 28 },
  { star: '5 stars', count: 42 },
];

export const Default: Story = {
  args: {
    chartData: starRatingData,
  },
};
