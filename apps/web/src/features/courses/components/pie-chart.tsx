import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type PieChartProps = {
  width?: number;
  height?: number;
  colors?: string[];
  globalCursorPointer?: boolean;
  handlePieClick?: (index: number) => void;
  selectedPieNumber?: number | null;
};

export default function PieChart({
  width = 350,
  height = 400,
  colors,
  globalCursorPointer,
  handlePieClick,
  selectedPieNumber,
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
      .outerRadius((_, i) =>
        selectedPieNumber === i
          ? Math.min(width, height) / 2
          : Math.min(width, height) / 2 - 10,
      );

    // Append the pie slices to the SVG
    container
      .selectAll('path')
      .data(pie)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', (_, i) => (colors && colors[i]) || d3.schemeCategory10[i])
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .attr('transform', `translate(${width / 2},${height / 2}) scale(0.88)`)
      .on('click', (_, i) => {
        if (handlePieClick) {
          handlePieClick(i.index);
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
        if (handlePieClick && i !== selectedPieNumber) {
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
  ]);

  return <svg ref={ref}></svg>;
}
