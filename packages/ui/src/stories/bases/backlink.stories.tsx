import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackLink } from '#src/bases/backlink.tsx';

const meta: Meta<typeof BackLink> = {
  title: 'Bases/backlink',
  component: BackLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    to: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
  args: {
    to: '/',
    label: 'Back',
    className:
      'flex items-center subtitle-large-med-20px md:display-large text-darkOrange-5 hover:text-white',
  },
};

export default meta;

type Story = StoryObj<typeof BackLink>;

export const Default: Story = {
  args: {},
};

export const CustomLabel: Story = {
  args: {
    label: 'Return',
    to: '/previous',
  },
};
