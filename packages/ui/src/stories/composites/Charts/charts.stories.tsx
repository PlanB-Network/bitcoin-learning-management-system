import type { Meta, StoryObj } from '@storybook/react-vite';
import * as Recharts from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../bases/charts.tsx';

const meta: Meta<typeof ChartContainer> = {
  title: 'Composites/Charts/charts',
  component: ChartContainer,
  tags: ['autodocs'],
  argTypes: {
    config: {
      control: 'object',
      description: 'Configuration for chart data labels and colors.',
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

type Story = StoryObj<typeof ChartContainer>;

const sampleRatingData = [
  { rating: 1, reviews: 20 },
  { rating: 2, reviews: 50 },
  { rating: 3, reviews: 120 },
  { rating: 4, reviews: 180 },
  { rating: 5, reviews: 250 },
];

const ratingChartConfig: ChartConfig = {
  reviews: {
    label: 'Number of reviews:',
    color: '#ff5c00',
  },
};

export const RatingsBarChart: Story = {
  name: 'Ratings Bar Chart',
  args: {
    config: ratingChartConfig,
    className: 'h-[300px] w-full',
  },
  render: (args) => (
    <ChartContainer {...args}>
      <Recharts.BarChart
        accessibilityLayer
        data={sampleRatingData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <Recharts.CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Recharts.XAxis dataKey="rating" tickLine={false} axisLine={false} />
        <Recharts.YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Recharts.Bar
          dataKey="reviews"
          fill="var(--color-reviews)"
          radius={4}
        />
      </Recharts.BarChart>
    </ChartContainer>
  ),
};

export const RatingsLineChart: Story = {
  name: 'Ratings Line Chart',
  args: {
    config: ratingChartConfig,
    className: 'h-[300px] w-full',
  },
  render: (args) => (
    <ChartContainer {...args}>
      <Recharts.LineChart
        accessibilityLayer
        data={sampleRatingData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <Recharts.CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Recharts.XAxis dataKey="rating" tickLine={false} axisLine={false} />
        <Recharts.YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Recharts.Line
          type="monotone"
          dataKey="reviews"
          stroke="var(--color-reviews)"
          strokeWidth={2}
          dot={false}
        />
      </Recharts.LineChart>
    </ChartContainer>
  ),
};

export const RatingsAreaChart: Story = {
  name: 'Ratings Area Chart',
  args: {
    config: ratingChartConfig,
    className: 'h-[300px] w-full',
  },
  render: (args) => (
    <ChartContainer {...args}>
      <Recharts.AreaChart
        accessibilityLayer
        data={sampleRatingData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <Recharts.CartesianGrid strokeDasharray="3 3" />
        <Recharts.XAxis dataKey="rating" />
        <Recharts.YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Recharts.Area
          type="monotone"
          dataKey="reviews"
          stroke="var(--color-reviews)"
          fill="var(--color-reviews)"
          fillOpacity={0.5}
        />
      </Recharts.AreaChart>
    </ChartContainer>
  ),
};
