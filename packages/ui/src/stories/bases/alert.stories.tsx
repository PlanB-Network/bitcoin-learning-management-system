import type { Meta, StoryObj } from '@storybook/react-vite';
import { IoMdAlert } from 'react-icons/io';
import { Alert, AlertDescription, AlertTitle } from '#src/bases/alert.tsx';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Bases/alert',
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
    variant: {
      control: 'select',
      options: ['default', 'transparent', 'destructive'],
      defaultValue: 'default',
    },
    hasCloseButton: {
      control: 'boolean',
      defaultValue: false,
    },
    className: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Heads up!</AlertTitle>
        <AlertDescription>
          <p>You can add components to your app using the cli.</p>
        </AlertDescription>
      </>
    ),
  },
};

export const Transparent: Story = {
  args: {
    variant: 'transparent',
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Notification</AlertTitle>
        <AlertDescription>
          <p>This is a transparent notification alert.</p>
        </AlertDescription>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Error</AlertTitle>
        <AlertDescription>
          <p>Your session has expired. Please log in again.</p>
        </AlertDescription>
      </>
    ),
  },
};

export const DefaultTitleOnly: Story = {
  name: 'Default (Title Only)',
  args: {
    variant: 'default',
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Important Update</AlertTitle>
      </>
    ),
  },
};

export const DefaultDescriptionOnly: Story = {
  name: 'Default (Description Only)',
  args: {
    variant: 'default',
    children: (
      <>
        <AlertDescription>
          <p>
            Just a description here, providing some context or details without a
            formal title.
          </p>
        </AlertDescription>
      </>
    ),
  },
};

export const DefaultWithoutIcon: Story = {
  name: 'Default (No Icon)',
  args: {
    variant: 'default',
    children: (
      <>
        <AlertTitle>Simple Alert</AlertTitle>
        <AlertDescription>
          <p>This alert does not have an icon.</p>
        </AlertDescription>
      </>
    ),
  },
};

export const WithCloseButton: Story = {
  name: 'With Close Button',
  args: {
    variant: 'default',
    hasCloseButton: true,
    children: (
      <>
        <AlertTitle>Critical Warning</AlertTitle>
        <AlertDescription>
          <p>This is a critical warning without an icon.</p>
        </AlertDescription>
      </>
    ),
  },
};

export const WithCustomClass: Story = {
  name: 'Default (Custom Class)',
  args: {
    variant: 'default',
    className: 'shadow-lg bg-red-2',
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Custom Styled Alert</AlertTitle>
        <AlertDescription>
          <p>
            This alert has additional custom styling via the className prop.
          </p>
        </AlertDescription>
      </>
    ),
  },
};
