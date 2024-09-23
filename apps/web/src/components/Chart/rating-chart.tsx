import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@blms/ui';

interface RatingChartProps {
  chartData: Array<{ [key: string]: string | number }>;
}

const chartConfig = {
  data: {
    color: '#FF5C00',
  },
} satisfies ChartConfig;

export const RatingChart = ({ chartData }: RatingChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="min-h-[292px] w-full">
      <BarChart
        accessibilityLayer
        margin={{
          top: 16,
        }}
        data={chartData}
      >
        <CartesianGrid
          vertical={true}
          horizontal={false}
          strokeDasharray="3"
          stroke="#CCC"
        />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          axisLine={true}
          tickMargin={6}
          tickSize={12}
          tickLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideIndicator
              labelKey={Object.keys(chartData[0])[1]}
            />
          }
        />
        <Bar
          dataKey={Object.keys(chartData[0])[1]}
          fill="var(--color-data)"
          radius={4}
        >
          <LabelList
            position="top"
            offset={8}
            className="fill-newBlack-1 italic"
            fontSize={10}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
