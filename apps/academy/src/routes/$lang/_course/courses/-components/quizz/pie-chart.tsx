import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface PieChartProps {
  width?: number;
  height?: number;
  colors?: string[];
  globalCursorPointer?: boolean;
  handlePieClick?: (index: number) => void;
  selectedPieNumber?: number | null;
  onClickNextStep?: () => void;
  className?: string;
}

interface PieSliceData {
  data: number;
  index: number;
  value: number;
  startAngle: number;
  endAngle: number;
}

export default function PieChart({
  width = 350,
  height = 400,
  colors,
  globalCursorPointer,
  handlePieClick,
  selectedPieNumber,
  onClickNextStep,
  className,
}: PieChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Select the SVG element using D3
    const svg = d3
      .select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .style('-webkit-user-select', 'none')
      .style('-moz-user-select', 'none')
      .style('-ms-user-select', 'none')
      .style('user-select', 'none');

    // Remove all elements before drawing
    svg.selectAll('*').remove();

    // Create containers
    const container = svg.append('g');

    // Data for the pie chart (5 equal parts)
    const data = [1, 1, 1, 1, 1];

    // Calculate angles for the pie slices
    const pie = d3.pie<number>()(data);

    // Create an arc generator
    const arcGenerator = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2);

    // Append the pie slices to the SVG
    container
      .selectAll('path')
      .data(pie)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', (_, i) => colors?.[i] || d3.schemeCategory10[i])
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr(
        'transform',
        (_, i) =>
          `translate(${width / 2},${height / 2}) scale(${selectedPieNumber === i ? 0.97 : 0.88})`,
      )
      .on('click', (_, i) => {
        if (handlePieClick) {
          handlePieClick(i.index);
          if (onClickNextStep) {
            onClickNextStep();
          }
        }
      });

    if (handlePieClick) {
      container.attr('cursor', 'pointer');
    }

    if (globalCursorPointer) {
      container.attr('cursor', 'pointer');
    }

    // Add mouseover and mouseout events
    container
      .selectAll('path')
      .on('mouseover', function (_, i) {
        if (handlePieClick && i !== selectedPieNumber) {
          d3.select(this).attr(
            'transform',
            `translate(${width / 2},${height / 2}) scale(0.97)`,
          );
        }
      })
      .on('mouseout', function (_, i) {
        const sliceData = i as PieSliceData;
        if (handlePieClick && sliceData.index !== selectedPieNumber) {
          d3.select(this).attr(
            'transform',
            `translate(${width / 2},${height / 2}) scale(0.88)`,
          );
        }
      });
  }, [
    width,
    height,
    colors,
    handlePieClick,
    selectedPieNumber,
    globalCursorPointer,
    onClickNextStep,
  ]);

  return <svg className={className} ref={ref} />;
}
