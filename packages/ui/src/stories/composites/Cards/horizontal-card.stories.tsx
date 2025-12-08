import type { Meta, StoryObj } from '@storybook/react-vite';
import { HorizontalCard } from '#src/composites/Cards/horizontal-card.tsx';

const meta: Meta<typeof HorizontalCard> = {
  title: 'Composites/Cards/horizontal-card',
  component: HorizontalCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Bitcoin 101',
    subtitle: 'Learn the fundamentals of the decentralized currency.',
    link: 'https://planb.academy',
    thumbnail: 'https://placehold.co/80x80',
  },
  argTypes: {
    title: {
      control: 'text',
    },
    subtitle: {
      control: 'text',
    },
    link: {
      control: 'text',
    },
    thumbnail: {
      control: 'text',
      description: 'URL for the image source',
    },
    className: {
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof HorizontalCard>;

export const Default: Story = {
  args: {},
};

export const WithoutSubtitle: Story = {
  args: {
    title: 'Advanced Economics',
    subtitle: undefined,
    thumbnail: 'https://placehold.co/150x150',
  },
};

export const LongSubtitle: Story = {
  args: {
    title: 'History of Money',
    subtitle:
      'This is a very long subtitle to demonstrate the line-clamp functionality. It should automatically truncate after two lines of text on desktop screens, keeping the layout clean and consistent regardless of the content length.',
  },
};

export const CustomStyling: Story = {
  args: {
    title: 'Highlighted Card',
    subtitle: 'This card has a custom background color applied via className.',
    className: 'bg-neutral-100 border border-neutral-200',
  },
};
