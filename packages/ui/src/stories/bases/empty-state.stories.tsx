import type { Meta, StoryObj } from '@storybook/react-vite';
import { TbCertificateOff } from 'react-icons/tb';
import { EmptyState } from '#src/bases/empty-state.tsx';

const meta: Meta<typeof EmptyState> = {
  argTypes: {
    className: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    icon: {
      control: 'object',
    },
    actionButton: {
      control: 'object',
    },
    linkButton: {
      control: 'object',
    },
  },
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/empty-state',
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    className: 'bg-white',
    title:
      'There is currently no exam linked to this course. If you want to create an exam, please contact us.',
  },
};

export const WithDescription: Story = {
  args: {
    className: 'bg-white',
    title: 'No certificates available',
    description:
      'You have not obtained any certificates yet. Complete a course to earn your first certificate!',
  },
};

export const WithIcon: Story = {
  args: {
    className: 'bg-white',
    title: 'No certificates available',
    description:
      'You have not obtained any certificates yet. Complete a course to earn your first certificate!',
    icon: TbCertificateOff,
  },
};

export const WithActionButton: Story = {
  args: {
    className: 'bg-white',
    title: 'No certificates available',
    description:
      'You have not obtained any certificates yet. Complete a course to earn your first certificate!',
    icon: TbCertificateOff,
    actionButton: { onClick: () => alert('Action!'), label: 'Take Action' },
  },
};

export const WithLinkButton: Story = {
  args: {
    className: 'bg-white',
    title: 'No certificates available',
    description:
      'You have not obtained any certificates yet. Complete a course to earn your first certificate!',
    icon: TbCertificateOff,
    linkButton: { href: '/learn-anytime', label: 'Explore Courses' },
  },
};
