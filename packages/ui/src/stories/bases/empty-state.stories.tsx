import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from '#src/bases/empty-state.tsx';

const meta: Meta<typeof EmptyState> = {
  argTypes: {
    className: {
      control: 'text',
    },
    message: {
      control: 'text',
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
    className: '',
    message:
      'There is currently no exam linked to this course. If you want to create an exam, please contact us.',
  },
};
