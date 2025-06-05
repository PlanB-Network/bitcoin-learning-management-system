import type { Meta, StoryObj } from '@storybook/react-vite';
import { HorizontalCard } from '#src/molecules/Cards/horizontal-card.tsx';

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
  title: 'Molecules/Cards/horizontal-card',
  component: HorizontalCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    subtitle: {
      control: 'text',
    },
    buttonText: {
      control: 'text',
    },
    buttonVariant: {
      control: { type: 'select' },
      options: buttonVariants,
    },
    buttonLink: {
      control: 'text',
    },
    languages: {
      control: 'object',
    },
    className: {
      control: 'text',
    },
  },
  args: {
    title: 'Bitcoin 101',
    subtitle: 'Learn the fundamentals',
    buttonText: 'Start Learning',
    buttonVariant: 'primary',
    buttonLink: '/course/bitcoin',
    languages: ['en', 'fr'],
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
    buttonText: 'Begin Course',
    languages: ['en', 'es', 'de'],
  },
};

export const NoButton: Story = {
  args: {
    title: 'Coming Soon',
    subtitle: 'Lightning Network Basics',
    buttonText: undefined,
    buttonLink: undefined,
    languages: ['en', 'fr'],
  },
};

export const DisabledButton: Story = {
  args: {
    title: 'Premium Course',
    subtitle: 'Requires payment',
    buttonText: 'Locked',
    buttonLink: undefined,
    languages: ['en'],
  },
};

export const MultipleLanguages: Story = {
  args: {
    title: 'Global Economics',
    subtitle: 'Available in many languages',
    buttonText: 'Explore',
    languages: ['en', 'fr', 'es', 'de', 'ja'],
  },
};
