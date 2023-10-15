import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useNavigate } from '@tanstack/react-router';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

// TODO move it somewhere else ?
export interface Course {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  unreleased?: boolean;
}

interface SolarSystemProps {
  courses: Course[];
}

type PlanetProps = {
  container: d3.Selection<SVGGElement, unknown, null, undefined>;
  tooltipsContainer: d3.Selection<SVGGElement, unknown, null, undefined>;
  radius: number;
  angle: number;
  offsetX: number;
  offsetY: number;
  course: Course;
  navigate: ReturnType<typeof useNavigate>;
  setHoveredCourse: React.Dispatch<React.SetStateAction<Course | null>>;
};

const Planet = ({
  container,
  tooltipsContainer,
  radius,
  angle,
  offsetX,
  offsetY,
  course,
  navigate,
  setHoveredCourse,
}: PlanetProps) => {
  const planetGroup = container
    .append('g')
    .attr(
      'transform',
      `translate(${radius * Math.cos(angle) + offsetX}, ${
        radius * Math.sin(angle) + offsetY
      })`,
    );

  const scaleGroup = planetGroup.append('g').style('pointer-events', 'all');

  const planetCircle = scaleGroup
    .append('circle')
    .attr('r', 4)
    .style('fill', course.unreleased ? '#17284F' : '#2d4c95');

  const courseId = course.id.toUpperCase();
  if (courseId.length > 7) {
    // Split course id into letters and numbers
    const letters = courseId.match(/[A-Za-z]+/)?.[0] || '';
    const numbers = courseId.match(/\d+/)?.[0] || '';

    // Append letters
    scaleGroup
      .append('text')
      .attr('dy', '-.05em') // Adjust dy for letters
      .text(letters)
      .style('fill', course.unreleased ? '#ADB4BC' : 'white')
      .style('font-size', '0.1em');

    // Append numbers
    scaleGroup
      .append('text')
      .attr('dy', '1em') // Adjust dy for numbers
      .text(numbers)
      .style('fill', course.unreleased ? '#ADB4BC' : 'white')
      .style('font-size', '0.1em');
  } else {
    scaleGroup
      .append('text')
      .attr('dy', '.35em')
      .text(courseId)
      .style('fill', course.unreleased ? '#ADB4BC' : 'white')
      .style('font-size', '0.1em');
  }

  scaleGroup
    .append('circle')
    .attr('r', 4)
    .style('fill', 'transparent')
    .style('cursor', 'normal');

  if (course.unreleased) {
    planetCircle
      .style('stroke', '#2d4c95') // Set the color of the border
      .style('stroke-width', 0.05);

    return;
  }

  scaleGroup.on('mouseover', () => {
    setHoveredCourse(course);

    const xPos = radius * Math.cos(angle) + offsetX;
    const yPos = radius * Math.sin(angle) + offsetY;

    const tooltip = tooltipsContainer
      .append('g')
      .attr('transform', `translate(${xPos}, ${yPos})`);

    const tooltipRect = tooltip
      .append('rect') // Insert the rect before the text
      .attr('rx', 2) // corner radius
      .attr('ry', 2)
      .style('fill', '#f2870d')
      .style('visibility', 'hidden');

    const tooltipText = tooltip
      .append('text')
      .attr('dy', '4em') // position it below the planet
      .text(course.name)
      .style('fill', '#fff')
      .style('font-size', '0.12em')
      .style('visibility', 'hidden');

    const bbox = tooltipText.node()?.getBBox();
    if (!bbox) return;

    tooltipRect
      .attr('x', bbox.x - 1)
      .attr('y', bbox.y - 1)
      .attr('width', bbox.width + 2)
      .attr('height', bbox.height + 2);

    scaleGroup.transition().style('cursor', 'pointer');
    scaleGroup.transition().duration(150).attr('transform', 'scale(1.1)');
    planetCircle.transition().duration(150).style('fill', '#f2870d');
    tooltipRect
      .transition()
      .delay(50)
      .duration(150)
      .style('visibility', 'visible');
    tooltipText
      .transition()
      .delay(50)
      .duration(150)
      .style('visibility', 'visible');

    planetGroup.on('mouseout', function () {
      tooltip.remove();
      setHoveredCourse(null);
    });
  });

  scaleGroup.on('click', (event) => {
    event.stopPropagation();
    navigate({ to: '/courses/$courseId', params: { courseId: course.id } });
  });
};

export const SolarSystem: React.FC<SolarSystemProps> = ({ courses }) => {
  const navigate = useNavigate();
  const isScreenMd = useGreater('sm');
  const isScreenLg = useGreater('md');
  const isScreenXl = useGreater('lg');
  const [, setHoveredCourse] = useState<Course | null>(null);

  const ref = useRef<SVGSVGElement | null>(null);

  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const orbits = levels.map((level) =>
    courses.filter((course) => course.level === level),
  );

  useEffect(() => {
    if (ref.current) {
      const svg = d3
        .select(ref.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '-60 -50 120 100')
        .attr('font-family', 'Poppins')
        .attr('text-anchor', 'middle');

      svg
        .style('-webkit-user-select', 'none') // Chrome, Safari and Opera
        .style('-moz-user-select', 'none') // Firefox
        .style('-ms-user-select', 'none') // Internet Explorer/Edge
        .style('user-select', 'none');

      // Remove all elements before drawing
      svg.selectAll('*').remove();

      // Create containers. The order is important for the z-index of the elements
      // We draw the tooltips last so they are on top of everything else
      const container = svg.append('g');
      const orbitsContainer = container.append('g');
      const planetsContainer = container.append('g');
      const tooltipsContainer = container.append('g');

      orbits.forEach((orbitCourses, i) => {
        const radius = 5 + (i + 1) * 10;
        const angleOffset =
          Math.PI / 4 + ((i / orbits.length) * 2 * Math.PI) / 2;

        // Offset the orbits a bit so they are not concentric
        const orbitCenterOffset = 0.5;
        const rotationAngle = (i / orbits.length) * 5 * Math.PI;
        const offsetX = orbitCenterOffset * Math.cos(rotationAngle);
        const offsetY = orbitCenterOffset * Math.sin(rotationAngle);

        // Draw orbits
        orbitsContainer
          .append('circle')
          .attr('cx', offsetX)
          .attr('cy', offsetY)
          .attr('r', radius)
          .style('stroke', '#6c87c6')
          .style('stroke-width', 0.3)
          .style('stroke-dasharray', '0.6,1.2')
          .style('fill', 'none');

        // Draw planets for each orbit
        orbitCourses.forEach((course, index) => {
          const angle =
            ((360 / orbitCourses.length) * index * Math.PI) / 180 + angleOffset;

          Planet({
            container: planetsContainer,
            tooltipsContainer,
            radius,
            angle,
            offsetX,
            offsetY,
            course,
            navigate,
            setHoveredCourse,
          });
        });
      });

      // Setup zooming only for small screens
      if (!isScreenMd) {
        const zoom = d3
          .zoom()
          .scaleExtent([1, 3])
          .translateExtent([
            [-60, -60],
            [60, 60],
          ])
          .on('zoom', function (event) {
            const bbox = container.node()?.getBBox();
            const [mouseX, mouseY] = d3.pointer(event.sourceEvent, svg.node());

            if (
              (bbox &&
                mouseX >= bbox.x &&
                mouseX <= bbox.x + bbox.width &&
                mouseY >= bbox.y &&
                mouseY <= bbox.y + bbox.height) ||
              event.sourceEvent.type.startsWith('touch')
            ) {
              container.attr('transform', event.transform);
            }
          });

        // Not sure why it doesn't accept the type of zoom, as it is according to the docs. Maybe an outdated type?
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignores
        svg.call(zoom);

        // Prevent double click zoom
        svg.on('dblclick.zoom', null);
        // svg.on('touchstart.zoom', null);
      } else {
        svg.style('pointer-events', 'none');
      }
    }
  }, [orbits, isScreenMd, isScreenLg, isScreenXl, navigate]);

  return (
    <div className="flex w-full flex-col items-center px-4 md:px-10">
      <svg className="max-w-6xl" ref={ref} />
    </div>
  );
};
