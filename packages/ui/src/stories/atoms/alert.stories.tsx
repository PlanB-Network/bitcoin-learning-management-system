import type { Meta, StoryObj } from '@storybook/react';
import { IoMdAlert } from 'react-icons/io';
import { Alert, AlertDescription, AlertTitle } from '#src/atoms/alert.tsx';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Atoms/alert',
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
        <IoMdAlert className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
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
        <IoMdAlert className="h-4 w-4" />
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>
          <p>This is a transparent notification alert.</p>
        </AlertDescription>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <IoMdAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
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
        <IoMdAlert className="h-4 w-4" />
        <AlertTitle>Important Update</AlertTitle>
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
        <IoMdAlert className="h-4 w-4" />
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

export const DestructiveWithoutIcon: Story = {
  name: 'Destructive (No Icon)',
  args: {
    variant: 'destructive',
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
        <IoMdAlert className="h-4 w-4" />
        <AlertTitle>Custom Styled Alert</AlertTitle>
        <AlertDescription>
          <p>
            This alert has additional custom styling via the className prop.
          </p>
        </AlertDescription>
      </>
    ),
  },
};
