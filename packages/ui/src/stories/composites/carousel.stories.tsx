import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../bases/carousel.tsx';

const meta: Meta<typeof Carousel> = {
  argTypes: {
    className: {
      control: 'text',
    },
    opts: {
      control: 'object',
      description: 'Options (check Embla Carousel docs)',
    },
    orientation: {
      table: {
        disable: true,
      },
    },
    plugins: {
      table: {
        disable: true,
      },
    },
    setApi: {
      table: {
        disable: true,
      },
    },
  },
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/carousel',
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  args: {
    className: 'w-full',
    orientation: 'horizontal',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: explanation
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="flex aspect-video items-center justify-center rounded-md bg-darkOrange-5 text-black">
                <span className="text-4xl font-semibold">
                  Slide {index + 1}
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const LoopCarousel: Story = {
  args: {
    className: 'w-full',
    opts: {
      loop: true,
    },
    orientation: 'horizontal',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: explanation
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="flex aspect-video items-center justify-center rounded-md bg-darkOrange-5 text-black">
                <span className="text-4xl font-semibold">
                  Slide {index + 1}
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
