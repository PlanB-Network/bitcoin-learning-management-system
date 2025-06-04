import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../atoms/carousel.tsx';

const meta: Meta<typeof Carousel> = {
  title: 'Organisms/carousel',
  component: Carousel,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      table: {
        disable: true,
      },
    },
    opts: {
      control: 'object',
      description: 'Options (check Embla Carousel docs)',
    },
    className: {
      control: 'text',
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
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  args: {
    orientation: 'horizontal',
    className: 'w-full',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
    orientation: 'horizontal',
    opts: {
      loop: true,
    },
    className: 'w-full',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
