import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '#src/atoms/checkbox.tsx';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Stories/form/checkbox',
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
    size: {
      control: 'select',
      options: ['s', 'm'],
      defaultValue: 'm',
    },
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const DefaultMedium: Story = {
  name: 'Default Medium (Unchecked)',
  args: {
    size: 'm',
    checked: false,
    disabled: false,
  },
};

export const DefaultSmall: Story = {
  name: 'Default Small (Unchecked)',
  args: {
    size: 's',
    checked: false,
    disabled: false,
  },
};

export const CheckedMedium: Story = {
  name: 'Checked Medium',
  args: {
    size: 'm',
    checked: true,
    disabled: false,
  },
};

export const CheckedSmall: Story = {
  name: 'Checked Small',
  args: {
    size: 's',
    checked: true,
    disabled: false,
  },
};

export const DisabledUncheckedMedium: Story = {
  name: 'Disabled Medium (Unchecked)',
  args: {
    size: 'm',
    checked: false,
    disabled: true,
  },
};

export const DisabledCheckedMedium: Story = {
  name: 'Disabled Medium (Checked)',
  args: {
    size: 'm',
    checked: true,
    disabled: true,
  },
};

export const DisabledUncheckedSmall: Story = {
  name: 'Disabled Small (Unchecked)',
  args: {
    size: 's',
    checked: false,
    disabled: true,
  },
};

export const DisabledCheckedSmall: Story = {
  name: 'Disabled Small (Checked)',
  args: {
    size: 's',
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  name: 'With Label (Medium)',
  args: {
    size: 'm',
    id: 'terms-checkbox-medium',
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
  name: 'With Label (Small)',
  args: {
    size: 's',
    id: 'terms-checkbox-small',
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
