import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackLink } from '#src/bases/backlink.tsx';

const meta: Meta<typeof BackLink> = {
  args: {
    className:
      'flex items-center subtitle-large-med-20px md:display-large text-darkOrange-5 hover:text-white',
    label: 'Back',
    to: '/',
  },
  argTypes: {
    className: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    to: {
      control: 'text',
    },
  },
  component: BackLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/backlink',
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
