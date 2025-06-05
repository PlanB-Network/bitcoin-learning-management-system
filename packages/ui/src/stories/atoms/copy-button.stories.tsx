import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from '#src/atoms/copy-button.tsx';

const meta: Meta<typeof CopyButton> = {
  title: 'Atoms/copy-button',
  component: CopyButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
    },
  },
  args: {
    text: 'Hello, World!',
  },
};

export default meta;

type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {
  args: {},
};

export const JSONData: Story = {
  args: {
    text: '{"name": "John Doe", "email": "john@example.com", "age": 30}',
  },
};
