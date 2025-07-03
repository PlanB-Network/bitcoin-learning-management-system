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
  argTypes: {
    className: {
      control: 'text',
    },
    config: {
      control: 'object',
      description: 'Configuration for chart data labels and colors.',
    },
  },
  component: ChartContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Charts/charts',
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
    color: '#ff5c00',
    label: 'Number of reviews:',
  },
};

export const RatingsBarChart: Story = {
  args: {
    className: 'h-[300px] w-full',
    config: ratingChartConfig,
  },
  name: 'Ratings Bar Chart',
  render: (args) => (
    <ChartContainer {...args}>
      <Recharts.BarChart
        accessibilityLayer
        data={sampleRatingData}
        margin={{ bottom: 5, left: 20, right: 30, top: 20 }}
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
  args: {
    className: 'h-[300px] w-full',
    config: ratingChartConfig,
  },
  name: 'Ratings Line Chart',
  render: (args) => (
    <ChartContainer {...args}>
      <Recharts.LineChart
        accessibilityLayer
        data={sampleRatingData}
        margin={{ bottom: 5, left: 20, right: 30, top: 20 }}
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
  args: {
    className: 'h-[300px] w-full',
    config: ratingChartConfig,
  },
  name: 'Ratings Area Chart',
  render: (args) => (
    <ChartContainer {...args}>
      <Recharts.AreaChart
        accessibilityLayer
        data={sampleRatingData}
        margin={{ bottom: 0, left: 0, right: 30, top: 10 }}
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
