import type { Meta, StoryObj } from '@storybook/react-vite';
import { PublicComment } from '#src/composites/Comments/public-comment.tsx';

const meta: Meta<typeof PublicComment> = {
  title: 'Composites/Comments/public-comment',
  component: PublicComment,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    author: {
      control: 'text',
    },
    date: {
      control: 'text',
    },
    avatar: {
      control: 'text',
    },
    comment: {
      control: 'text',
    },
  },
  args: {
    author: 'John Doe',
    date: '2025-03-15T10:30:00Z',
    avatar: undefined,
    comment:
      'This course was incredibly helpful! I learned so much about Bitcoin. The explanations were clear and easy to follow.',
  },
};

export default meta;

type Story = StoryObj<typeof PublicComment>;

export const Default: Story = {
  args: {},
};

export const LongComment: Story = {
  args: {
    author: 'Michael Smith',
    date: '2025-03-10T09:15:00Z',
    comment:
      'This is an excellent course that covers all the fundamentals of Bitcoin. I particularly enjoyed the sections on mining and wallet security. The instructor does a great job of breaking down complex topics into digestible pieces. I would highly recommend this to anyone looking to get started with Bitcoin. The practical exercises were especially valuable for reinforcing the theoretical concepts.',
  },
};
