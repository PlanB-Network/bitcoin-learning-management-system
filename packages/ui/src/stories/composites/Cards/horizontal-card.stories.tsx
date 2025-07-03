import type { Meta, StoryObj } from '@storybook/react-vite';
import { HorizontalCard } from '#src/composites/Cards/horizontal-card.tsx';

const buttonVariants = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'outlineWhite',
  'ghost',
  'transparent',
] as const;

const meta: Meta<typeof HorizontalCard> = {
  args: {
    buttonLink: '/course/bitcoin',
    buttonText: 'Start Learning',
    buttonVariant: 'primary',
    languages: ['en', 'fr'],
    subtitle: 'Learn the fundamentals',
    title: 'Bitcoin 101',
  },
  argTypes: {
    buttonLink: {
      control: 'text',
    },
    buttonText: {
      control: 'text',
    },
    buttonVariant: {
      control: { type: 'select' },
      options: buttonVariants,
    },
    className: {
      control: 'text',
    },
    languages: {
      control: 'object',
    },
    subtitle: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
  },
  component: HorizontalCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Cards/horizontal-card',
};

export default meta;

type Story = StoryObj<typeof HorizontalCard>;

export const Default: Story = {
  args: {},
};

export const WithoutSubtitle: Story = {
  args: {
    buttonText: 'Begin Course',
    languages: ['en', 'es', 'de'],
    subtitle: undefined,
    title: 'Advanced Economics',
  },
};

export const NoButton: Story = {
  args: {
    buttonLink: undefined,
    buttonText: undefined,
    languages: ['en', 'fr'],
    subtitle: 'Lightning Network Basics',
    title: 'Coming Soon',
  },
};

export const DisabledButton: Story = {
  args: {
    buttonLink: undefined,
    buttonText: 'Locked',
    languages: ['en'],
    subtitle: 'Requires payment',
    title: 'Premium Course',
  },
};

export const MultipleLanguages: Story = {
  args: {
    buttonText: 'Explore',
    languages: ['en', 'fr', 'es', 'de', 'ja'],
    subtitle: 'Available in many languages',
    title: 'Global Economics',
  },
};
