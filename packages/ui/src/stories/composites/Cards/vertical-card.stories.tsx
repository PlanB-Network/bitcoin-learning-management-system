import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerticalCard } from '#src/composites/Cards/vertical-card.tsx';

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
  args: {
    buttonLink: '/course/bitcoin',
    buttonText: 'Start Course',
    buttonVariant: 'primary',
    cardColor: 'grey',
    category: 'Course',
    excerpt:
      'Learn the basics of Bitcoin technology in this comprehensive course.',
    externalLink: false,
    flagsOnMobile: false,
    imageSrc: 'https://placehold.co/320x240',
    imgClassName: 'w-full mb-1 rounded-[10px] md:rounded-3xl',
    isScreenMd: true,
    languages: ['en', 'fr'],
    onHoverArrow: true,
    onHoverCardColorChange: false,
    secondaryButtonText: undefined,
    secondaryButtonVariant: 'secondary',
    secondaryLink: undefined,
    subtitle: 'Introduction to cryptocurrency',
    tags: ['Beginner', 'Free'],
    title: 'Bitcoin Fundamentals',
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
    cardColor: {
      control: { type: 'select' },
      options: cardColors,
    },
    category: {
      control: 'text',
    },
    excerpt: {
      control: 'text',
    },
    externalLink: {
      control: 'boolean',
    },
    flagsOnMobile: {
      control: 'boolean',
    },
    imageSrc: {
      control: 'text',
    },
    imgClassName: {
      control: 'text',
    },
    isScreenMd: {
      control: 'boolean',
    },
    languages: {
      control: 'object',
    },
    onHoverArrow: {
      control: 'boolean',
    },
    onHoverCardColorChange: {
      control: 'boolean',
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
    subtitle: {
      control: 'text',
    },
    tags: {
      control: 'object',
    },
    title: {
      control: 'text',
    },
  },
  component: VerticalCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Cards/vertical-card',
};

export default meta;

type Story = StoryObj<typeof VerticalCard>;

export const Default: Story = {
  args: {},
};

export const WithTwoButtons: Story = {
  args: {
    buttonText: 'Start Learning',
    category: 'Premium Course',
    secondaryButtonText: 'Preview',
    secondaryLink: '/preview/trading',
    title: 'Advanced Trading',
  },
};

export const WithManyLanguages: Story = {
  args: {
    flagsOnMobile: true,
    languages: ['en', 'fr', 'es', 'de', 'ja'],
    title: 'Global Economics',
  },
};

export const DisabledButton: Story = {
  args: {
    buttonLink: undefined,
    buttonText: 'Start Course',
    subtitle: 'Course in development',
    title: 'Coming Soon',
  },
};
