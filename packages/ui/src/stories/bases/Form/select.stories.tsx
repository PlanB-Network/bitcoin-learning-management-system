import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#src/bases/select.tsx';

const meta: Meta<typeof Select> = {
  title: 'Bases/Form/select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a user" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Professors</SelectLabel>
          <SelectItem value="prof-1">Prof 1</SelectItem>
          <SelectItem value="prof-2">Prof 2</SelectItem>
          <SelectItem value="prof-3">Prof 3</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Admins</SelectLabel>
          <SelectItem value="admin-1">Admin 1</SelectItem>
          <SelectItem value="admin-2">Admin 2</SelectItem>
          <SelectItem value="admin-3">Admin 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {},
};

export const LightMode: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]" mode="light">
        <SelectValue placeholder="Select a user (Light Mode)" />
      </SelectTrigger>
      <SelectContent mode="light">
        <SelectGroup>
          <SelectLabel>Professors</SelectLabel>
          <SelectItem value="prof-1">Prof 1</SelectItem>
          <SelectItem value="prof-2">Prof 2</SelectItem>
          <SelectItem value="prof-3">Prof 3</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Admins</SelectLabel>
          <SelectItem value="admin-1">Admin 1</SelectItem>
          <SelectItem value="admin-2">Admin 2</SelectItem>
          <SelectItem value="admin-3">Admin 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const NoScrollIcons: Story = {
  args: {},
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a user" />
      </SelectTrigger>
      <SelectContent showScrollIcon={false}>
        <SelectItem value="prof-1">Prof 1</SelectItem>
        <SelectItem value="admin-1">Admin 1</SelectItem>
        <SelectItem value="prof-2">Prof 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const CustomWidth: Story = {
  args: {},
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a long name" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="prof-1">
          Prof 1 with a very long name to test width of the select
        </SelectItem>
        <SelectItem value="admin-1">Admin 1</SelectItem>
        <SelectItem value="prof-2">Prof 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'prof-2',
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a user" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Professors</SelectLabel>
          <SelectItem value="prof-1">Prof 1</SelectItem>
          <SelectItem value="prof-2">Prof 2</SelectItem>
          <SelectItem value="prof-3">Prof 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a user (Disabled)" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Professors</SelectLabel>
          <SelectItem value="prof-1">Prof 1</SelectItem>
          <SelectItem value="prof-2">Prof 2</SelectItem>
          <SelectItem value="prof-3">Prof 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
