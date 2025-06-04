import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../../atoms/input.tsx';

const meta: Meta<typeof Input> = {
  title: 'Stories/form/input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    labelText: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    cornerHint: {
      table: {
        disable: true,
      },
    },
    mandatory: {
      control: 'boolean',
      description: 'If true, * is displayed next to the label',
    },
    error: {
      control: 'text',
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
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
    placeholder: 'This field is mandatory',
    mandatory: true,
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
    labelText: 'Email Address',
    placeholder: 'you@example.com',
    error: 'Invalid email format.',
    type: 'email',
  },
};

export const DisabledInput: Story = {
  args: {
    labelText: 'Disabled Input',
    placeholder: 'You cannot type here',
    disabled: true,
  },
};

export const InputWithTypeNumber: Story = {
  name: 'Input (Type: Number)',
  args: {
    labelText: 'Age',
    placeholder: 'Enter your age',
    type: 'number',
  },
};
