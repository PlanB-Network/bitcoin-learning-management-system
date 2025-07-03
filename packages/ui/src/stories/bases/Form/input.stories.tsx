import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '#src/bases/input.tsx';

const meta: Meta<typeof Input> = {
  argTypes: {
    className: {
      control: 'text',
    },
    cornerHint: {
      table: {
        disable: true,
      },
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
    labelText: {
      control: 'text',
    },
    mandatory: {
      control: 'boolean',
      description: 'If true, * is displayed next to the label',
    },
    placeholder: {
      control: 'text',
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
    },
  },
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/Form/input',
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    labelText: 'Default Input',
    placeholder: 'Enter text here',
  },
};

export const MandatoryInput: Story = {
  args: {
    labelText: 'Required Field',
    mandatory: true,
    placeholder: 'This field is mandatory',
  },
};

export const PasswordInput: Story = {
  args: {
    labelText: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
  },
};

export const WithError: Story = {
  args: {
    error: 'Invalid email format.',
    labelText: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const DisabledInput: Story = {
  args: {
    disabled: true,
    labelText: 'Disabled Input',
    placeholder: 'You cannot type here',
  },
};

export const InputWithTypeNumber: Story = {
  args: {
    labelText: 'Age',
    placeholder: 'Enter your age',
    type: 'number',
  },
  name: 'Input (Type: Number)',
};
