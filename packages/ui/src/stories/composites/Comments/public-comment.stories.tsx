import type { Meta, StoryObj } from '@storybook/react-vite';
import { PublicComment } from '#src/composites/Comments/public-comment.tsx';

const meta: Meta<typeof PublicComment> = {
  args: {
    author: 'John Doe',
    avatar: undefined,
    comment:
      'This course was incredibly helpful! I learned so much about Bitcoin. The explanations were clear and easy to follow.',
    date: '2025-03-15T10:30:00Z',
  },
  argTypes: {
    author: {
      control: 'text',
    },
    avatar: {
      control: 'text',
    },
    comment: {
      control: 'text',
    },
    date: {
      control: 'text',
    },
  },
  component: PublicComment,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Comments/public-comment',
};

export default meta;

type Story = StoryObj<typeof PublicComment>;

export const Default: Story = {
  args: {},
};

export const LongComment: Story = {
  args: {
    author: 'Michael Smith',
    comment:
      'This is an excellent course that covers all the fundamentals of Bitcoin. I particularly enjoyed the sections on mining and wallet security. The instructor does a great job of breaking down complex topics into digestible pieces. I would highly recommend this to anyone looking to get started with Bitcoin. The practical exercises were especially valuable for reinforcing the theoretical concepts.',
    date: '2025-03-10T09:15:00Z',
  },
};
