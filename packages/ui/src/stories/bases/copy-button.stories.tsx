import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from '#src/bases/copy-button.tsx';

const meta: Meta<typeof CopyButton> = {
  args: {
    text: 'Hello, World!',
  },
  argTypes: {
    text: {
      control: 'text',
    },
  },
  component: CopyButton,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/copy-button',
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
