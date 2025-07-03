import type { Meta, StoryObj } from '@storybook/react-vite';
import { IoMdAlert } from 'react-icons/io';
import { Alert, AlertDescription, AlertTitle } from '#src/bases/alert.tsx';

const meta: Meta<typeof Alert> = {
  argTypes: {
    className: {
      control: 'text',
    },
    hasCloseButton: {
      control: 'boolean',
      defaultValue: false,
    },
    variant: {
      control: 'select',
      defaultValue: 'default',
      options: ['default', 'transparent', 'destructive'],
    },
  },
  component: Alert,
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
  title: 'Bases/alert',
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Heads up!</AlertTitle>
        <AlertDescription>
          <p>You can add components to your app using the cli.</p>
        </AlertDescription>
      </>
    ),
    variant: 'default',
  },
};

export const Transparent: Story = {
  args: {
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Notification</AlertTitle>
        <AlertDescription>
          <p>This is a transparent notification alert.</p>
        </AlertDescription>
      </>
    ),
    variant: 'transparent',
  },
};

export const Warning: Story = {
  args: {
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Error</AlertTitle>
        <AlertDescription>
          <p>Your session has expired. Please log in again.</p>
        </AlertDescription>
      </>
    ),
    variant: 'warning',
  },
};

export const DefaultTitleOnly: Story = {
  args: {
    children: (
      <>
        <AlertTitle icon={IoMdAlert}>Important Update</AlertTitle>
      </>
    ),
    variant: 'default',
  },
  name: 'Default (Title Only)',
};

export const DefaultDescriptionOnly: Story = {
  args: {
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
    variant: 'default',
  },
  name: 'Default (Description Only)',
};

export const DefaultWithoutIcon: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Simple Alert</AlertTitle>
        <AlertDescription>
          <p>This alert does not have an icon.</p>
        </AlertDescription>
      </>
    ),
    variant: 'default',
  },
  name: 'Default (No Icon)',
};

export const WithCloseButton: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Critical Warning</AlertTitle>
        <AlertDescription>
          <p>This is a critical warning without an icon.</p>
        </AlertDescription>
      </>
    ),
    hasCloseButton: true,
    variant: 'default',
  },
  name: 'With Close Button',
};

export const WithCustomClass: Story = {
  args: {
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
    className: 'shadow-lg bg-red-2',
    variant: 'default',
  },
  name: 'Default (Custom Class)',
};
