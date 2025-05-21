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

const SwitchVariant = ({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Switch>) => (
  <div className="flex flex-col items-center gap-2 m-4">
    <Switch {...props} />
    <span
      className={`text-xs ${props.mode === 'dark' ? 'text-white' : 'text-black'}`}
    >
      {label}
    </span>
  </div>
);

export const Default: Story = {
  args: {
    size: 's',
    mode: 'dark',
    checked: false,
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const LightModeVariations: Story = {
  name: 'Light Mode Variations',
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="flex flex-wrap justify-center gap-5">
      <SwitchVariant
        label="Small Unchecked"
        size="s"
        mode="light"
        checked={false}
        disabled={false}
      />
      <SwitchVariant
        label="Small Checked"
        size="s"
        mode="light"
        checked={true}
        disabled={false}
      />
      <SwitchVariant
        label="Extra Small Unchecked"
        size="xs"
        mode="light"
        checked={false}
        disabled={false}
      />
      <SwitchVariant
        label="Extra Small Checked"
        size="xs"
        mode="light"
        checked={true}
        disabled={false}
      />
      <SwitchVariant
        label="Disabled Small Unchecked"
        size="s"
        mode="light"
        checked={false}
        disabled={true}
      />
      <SwitchVariant
        label="Disabled Small Checked"
        size="s"
        mode="light"
        checked={true}
        disabled={true}
      />
      <SwitchVariant
        label="Disabled Extra Small Unchecked"
        size="xs"
        mode="light"
        checked={false}
        disabled={true}
      />
      <SwitchVariant
        label="Disabled Extra Small Checked"
        size="xs"
        mode="light"
        checked={true}
        disabled={true}
      />
    </div>
  ),
};

export const DarkModeVariations: Story = {
  name: 'Dark Mode Variations',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="flex flex-wrap justify-center gap-5">
      <SwitchVariant
        label="Small Unchecked"
        size="s"
        mode="dark"
        checked={false}
        disabled={false}
      />
      <SwitchVariant
        label="Small Checked"
        size="s"
        mode="dark"
        checked={true}
        disabled={false}
      />
      <SwitchVariant
        label="Extra Small Unchecked"
        size="xs"
        mode="dark"
        checked={false}
        disabled={false}
      />
      <SwitchVariant
        label="Extra Small Checked"
        size="xs"
        mode="dark"
        checked={true}
        disabled={false}
      />
      <SwitchVariant
        label="Disabled Small Unchecked"
        size="s"
        mode="dark"
        checked={false}
        disabled={true}
      />
      <SwitchVariant
        label="Disabled Small Checked"
        size="s"
        mode="dark"
        checked={true}
        disabled={true}
      />
      <SwitchVariant
        label="Disabled Extra Small Unchecked"
        size="xs"
        mode="dark"
        checked={false}
        disabled={true}
      />
      <SwitchVariant
        label="Disabled Extra Small Checked"
        size="xs"
        mode="dark"
        checked={true}
        disabled={true}
      />
    </div>
  ),
};

export const WithLabels: Story = {
  name: 'With Labels',
  render: (args) => (
    <div className="flex flex-col gap-[30px]">
      <div className="flex items-center gap-2 text-black">
        <Switch
          {...args}
          size="s"
          mode="light"
          id="notifications-switch-light"
        />
        <label
          htmlFor="notifications-switch-light"
          className={`text-sm select-none ${args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
        >
          Enable Notifications (Light)
        </label>
      </div>

      <div className="bg-[#333333] p-5 rounded-lg flex items-center gap-2 text-white">
        <Switch {...args} size="s" mode="dark" id="darkmode-switch" />
        <label
          htmlFor="darkmode-switch"
          className={`text-sm select-none ${args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
        >
          Dark Mode (Dark)
        </label>
      </div>
    </div>
  ),
  args: {
    checked: false,
    disabled: false,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
};
