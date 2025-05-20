import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '#src/atoms/switch.tsx';

const meta: Meta<typeof Switch> = {
  component: Switch,
  title: 'Stories/form/switch',
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
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['xs', 's'],
      defaultValue: 's',
    },
    mode: {
      control: 'select',
      options: ['light', 'dark'],
      defaultValue: 'dark',
    },
    className: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const DefaultDarkSmallUnchecked: Story = {
  name: 'Default (Dark, Small, Unchecked)',
  args: {
    size: 's',
    mode: 'dark',
    checked: false,
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
};

export const DefaultDarkSmallChecked: Story = {
  name: 'Dark, Small, Checked',
  args: {
    size: 's',
    mode: 'dark',
    checked: true,
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
};

export const DefaultLightSmallUnchecked: Story = {
  name: 'Light, Small, Unchecked',
  args: {
    size: 's',
    mode: 'light',
    checked: false,
    disabled: false,
  },
};

export const DefaultLightSmallChecked: Story = {
  name: 'Light, Small, Checked',
  args: {
    size: 's',
    mode: 'light',
    checked: true,
    disabled: false,
  },
};

export const ExtraSmallDarkUnchecked: Story = {
  name: 'Dark, Extra Small, Unchecked',
  args: {
    size: 'xs',
    mode: 'dark',
    checked: false,
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
};

export const ExtraSmallDarkChecked: Story = {
  name: 'Dark, Extra Small, Checked',
  args: {
    size: 'xs',
    mode: 'dark',
    checked: true,
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
};

export const ExtraSmallLightUnchecked: Story = {
  name: 'Light, Extra Small, Unchecked',
  args: {
    size: 'xs',
    mode: 'light',
    checked: false,
    disabled: false,
  },
};

export const ExtraSmallLightChecked: Story = {
  name: 'Light, Extra Small, Checked',
  args: {
    size: 'xs',
    mode: 'light',
    checked: true,
    disabled: false,
  },
};

export const DisabledDarkSmallUnchecked: Story = {
  name: 'Disabled (Dark, Small, Unchecked)',
  args: {
    size: 's',
    mode: 'dark',
    checked: false,
    disabled: true,
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
};

export const DisabledDarkSmallChecked: Story = {
  name: 'Disabled (Dark, Small, Checked)',
  args: {
    size: 's',
    mode: 'dark',
    checked: true,
    disabled: true,
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
};

export const DisabledLightSmallUnchecked: Story = {
  name: 'Disabled (Light, Small, Unchecked)',
  args: {
    size: 's',
    mode: 'light',
    checked: false,
    disabled: true,
  },
};

export const DisabledLightSmallChecked: Story = {
  name: 'Disabled (Light, Small, Checked)',
  args: {
    size: 's',
    mode: 'light',
    checked: true,
    disabled: true,
  },
};

export const WithLabelSmallLight: Story = {
  name: 'With Label (Small, Light)',
  args: {
    size: 's',
    mode: 'light',
    id: 'notifications-switch-light',
  },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: args.mode === 'dark' ? 'white' : 'black',
      }}
    >
      <Switch {...args} />
      <label
        htmlFor={args.id}
        style={{
          fontSize: '14px',
          userSelect: 'none',
          cursor: args.disabled ? 'not-allowed' : 'pointer',
          opacity: args.disabled ? 0.5 : 1,
        }}
      >
        Enable Notifications
      </label>
    </div>
  ),
};

export const WithLabelSmallDark: Story = {
  name: 'With Label (Small, Dark)',
  args: {
    size: 's',
    mode: 'dark',
    id: 'darkmode-switch',
  },
  parameters: {
    backgrounds: { default: 'custom-dark' },
  },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: args.mode === 'dark' ? 'white' : 'black',
      }}
    >
      <Switch {...args} />
      <label
        htmlFor={args.id}
        style={{
          fontSize: '14px',
          userSelect: 'none',
          cursor: args.disabled ? 'not-allowed' : 'pointer',
          opacity: args.disabled ? 0.5 : 1,
        }}
      >
        Dark Mode
      </label>
    </div>
  ),
};
