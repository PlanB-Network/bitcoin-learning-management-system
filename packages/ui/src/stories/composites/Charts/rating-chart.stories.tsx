import type { Meta, StoryObj } from '@storybook/react-vite';
import { RatingChart } from '#src/composites/Chart/rating-chart.tsx';

const meta: Meta<typeof RatingChart> = {
  argTypes: {
    chartData: {
      description: 'Array of objects containing chart data',
    },
  },
  component: RatingChart,
  parameters: {},
  tags: ['autodocs'],
  title: 'Composites/Charts/rating-chart',
};

export default meta;

type Story = StoryObj<typeof RatingChart>;

const starRatingData = [
  { count: 35, star: '1 star' },
  { count: 12, star: '2 stars' },
  { count: 15, star: '3 stars' },
  { count: 28, star: '4 stars' },
  { count: 42, star: '5 stars' },
];

export const Default: Story = {
  args: {
    chartData: starRatingData,
  },
};
