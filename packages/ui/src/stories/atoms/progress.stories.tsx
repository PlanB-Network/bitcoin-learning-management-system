import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../../atoms/progress.tsx';
import OrangePill from '../assets/orange_pill_color.svg';

const meta: Meta<typeof Progress> = {
  component: Progress,
  title: 'Atoms/progress',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F2F2F2' },
        { name: 'dark', value: '#333333' },
      ],
    },
  },
  argTypes: {
    total: {
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '20' },
      },
    },
    completed: {
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '15' },
      },
    },
    pillImage: {
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    className: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => (
    <div className="relative w-full my-4">
      <Progress
        total={args.total}
        completed={args.completed}
        pillImage={args.pillImage}
        className={args.className}
      />
    </div>
  ),
  args: {
    total: 20,
    completed: 15,
    pillImage: OrangePill,
    className: 'w-40',
  },
};
