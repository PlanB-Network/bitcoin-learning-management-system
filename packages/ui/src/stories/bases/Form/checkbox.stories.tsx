import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '#src/bases/checkbox.tsx';

const meta: Meta<typeof Checkbox> = {
  argTypes: {
    checked: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      defaultValue: 'm',
      options: ['s', 'm'],
    },
  },
  component: Checkbox,
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
  title: 'Bases/Form/checkbox',
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const DefaultMedium: Story = {
  args: {
    checked: false,
    disabled: false,
    size: 'm',
  },
  name: 'Default Medium (Unchecked)',
};

export const DefaultSmall: Story = {
  args: {
    checked: false,
    disabled: false,
    size: 's',
  },
  name: 'Default Small (Unchecked)',
};

export const CheckedMedium: Story = {
  args: {
    checked: true,
    disabled: false,
    size: 'm',
  },
  name: 'Checked Medium',
};

export const CheckedSmall: Story = {
  args: {
    checked: true,
    disabled: false,
    size: 's',
  },
  name: 'Checked Small',
};

export const DisabledUncheckedMedium: Story = {
  args: {
    checked: false,
    disabled: true,
    size: 'm',
  },
  name: 'Disabled Medium (Unchecked)',
};

export const DisabledCheckedMedium: Story = {
  args: {
    checked: true,
    disabled: true,
    size: 'm',
  },
  name: 'Disabled Medium (Checked)',
};

export const DisabledUncheckedSmall: Story = {
  args: {
    checked: false,
    disabled: true,
    size: 's',
  },
  name: 'Disabled Small (Unchecked)',
};

export const DisabledCheckedSmall: Story = {
  args: {
    checked: true,
    disabled: true,
    size: 's',
  },
  name: 'Disabled Small (Checked)',
};

export const WithLabel: Story = {
  args: {
    id: 'terms-checkbox-medium',
    size: 'm',
  },
  name: 'With Label (Medium)',
  render: (args) => (
    <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
      <Checkbox {...args} />
      <label
        htmlFor={args.id}
        className="text-black label-medium-16px cursor-pointer"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const WithLabelSmall: Story = {
  args: {
    id: 'terms-checkbox-small',
    size: 's',
  },
  name: 'With Label (Small)',
  render: (args) => (
    <div style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
      <Checkbox {...args} />
      <label
        htmlFor={args.id}
        className="text-newBlack-1 subtitle-small-med-14px leading-[14px]"
      >
        Allow email notifications
      </label>
    </div>
  ),
};
