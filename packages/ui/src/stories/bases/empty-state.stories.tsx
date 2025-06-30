import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from '#src/bases/empty-state.tsx';

const meta: Meta<typeof EmptyState> = {
  title: 'Bases/empty-state',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    message:
      'There is currently no exam linked to this course. If you want to create an exam, please contact us.',
    className: '',
  },
};
