import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '#src/bases/progress.js';
import OrangePill from '../assets/orange_pill_color.svg';

const meta: Meta<typeof Progress> = {
  argTypes: {
    className: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    completed: {
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '15' },
        type: { summary: 'number' },
      },
    },
    pillImage: {
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    total: {
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '20' },
        type: { summary: 'number' },
      },
    },
  },
  component: Progress,
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F2F2F2' },
        { name: 'dark', value: '#333333' },
      ],
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/progress',
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    className: 'w-40',
    completed: 15,
    pillImage: OrangePill,
    total: 20,
  },
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
};
