import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerticalCard } from '#src/molecules/Cards/vertical-card.tsx';

const buttonVariants = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'outlineWhite',
  'ghost',
  'transparent',
] as const;

const cardColors = ['grey', 'maroon', 'orange', 'lightgrey'] as const;

const meta: Meta<typeof VerticalCard> = {
  title: 'Molecules/Cards/vertical-card',
  component: VerticalCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    imageSrc: {
      control: 'text',
    },
    imgClassName: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    subtitle: {
      control: 'text',
    },
    category: {
      control: 'text',
    },
    excerpt: {
      control: 'text',
    },
    cardColor: {
      control: { type: 'select' },
      options: cardColors,
    },
    onHoverCardColorChange: {
      control: 'boolean',
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
    secondaryButtonText: {
      control: 'text',
    },
    secondaryButtonVariant: {
      control: { type: 'select' },
      options: buttonVariants,
    },
    secondaryLink: {
      control: 'text',
    },
    externalLink: {
      control: 'boolean',
    },
    onHoverArrow: {
      control: 'boolean',
    },
    languages: {
      control: 'object',
    },
    tags: {
      control: 'object',
    },
    flagsOnMobile: {
      control: 'boolean',
    },
    isScreenMd: {
      control: 'boolean',
    },
  },
  args: {
    imageSrc: 'https://placehold.co/320x240',
    imgClassName: 'w-full mb-1 rounded-[10px] md:rounded-3xl',
    title: 'Bitcoin Fundamentals',
    subtitle: 'Introduction to cryptocurrency',
    category: 'Course',
    excerpt:
      'Learn the basics of Bitcoin technology in this comprehensive course.',
    cardColor: 'grey',
    onHoverCardColorChange: false,
    buttonText: 'Start Course',
    buttonVariant: 'primary',
    buttonLink: '/course/bitcoin',
    secondaryButtonText: undefined,
    secondaryButtonVariant: 'secondary',
    secondaryLink: undefined,
    externalLink: false,
    onHoverArrow: true,
    languages: ['en', 'fr'],
    tags: ['Beginner', 'Free'],
    flagsOnMobile: false,
    isScreenMd: true,
  },
};

export default meta;

type Story = StoryObj<typeof VerticalCard>;

export const Default: Story = {
  args: {},
};

export const WithTwoButtons: Story = {
  args: {
    title: 'Advanced Trading',
    category: 'Premium Course',
    buttonText: 'Start Learning',
    secondaryButtonText: 'Preview',
    secondaryLink: '/preview/trading',
  },
};

export const WithManyLanguages: Story = {
  args: {
    title: 'Global Economics',
    languages: ['en', 'fr', 'es', 'de', 'ja'],
    flagsOnMobile: true,
  },
};

export const DisabledButton: Story = {
  args: {
    title: 'Coming Soon',
    subtitle: 'Course in development',
    buttonText: 'Start Course',
    buttonLink: undefined,
  },
};
