import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListItem } from '#src/bases/ListItem/list-item.tsx';

const variants = ['dark', 'light', 'lightMaroon', 'grey'] as const;

const meta: Meta<typeof ListItem> = {
  title: 'Bases/list-item',
  component: ListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    leftText: 'Label',
    rightText: 'Value',
    variant: 'dark',
  },
  argTypes: {
    variant: { control: 'select', options: variants },
    hasIncreasedPadding: { control: 'boolean' },
    isDesktopOnly: { control: 'boolean' },
    isMobileOnly: { control: 'boolean' },
    wrapOnMobile: { control: 'boolean' },
    className: { control: 'text' },
    leftTextClassName: { control: 'text' },
    rightTextClassName: { control: 'text' },
    leftText: { control: 'text' },
    rightText: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="bg-neutral-900 p-6 max-w-md rounded">
        <Story />
      </div>
    ),
  ],
};

export const LightVariant: Story = {
  args: {
    leftText: 'Course Duration',
    rightText: '2 hours',
    variant: 'light',
  },
  decorators: [
    (Story) => (
      <div className="bg-white p-6 max-w-md rounded border border-neutral-200">
        <Story />
      </div>
    ),
  ],
};

export const LightMaroonVariant: Story = {
  args: {
    leftText: 'Difficulty Level',
    rightText: 'Intermediate',
    variant: 'lightMaroon',
  },
  decorators: [
    (Story) => (
      <div className="bg-maroon-1 p-6 max-w-md rounded border border-maroon-3">
        <Story />
      </div>
    ),
  ],
};

export const GreyVariant: Story = {
  args: {
    leftText: 'Language',
    rightText: 'English',
    variant: 'grey',
  },
  decorators: [
    (Story) => (
      <div className="bg-newGray-8 p-6 max-w-md rounded">
        <Story />
      </div>
    ),
  ],
};

export const WithReactNodeRight: Story = {
  args: {
    leftText: 'Status',
    rightText: (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
        Active
      </span>
    ),
  },
  decorators: [
    (Story) => (
      <div className="bg-neutral-900 p-6 max-w-md rounded">
        <Story />
      </div>
    ),
  ],
};

export const WithIncreasedPadding: Story = {
  args: {
    hasIncreasedPadding: true,
    leftText: 'Course Price',
    rightText: '$29.99',
  },
  decorators: [
    (Story) => (
      <div className="bg-neutral-900 p-6 max-w-md rounded">
        <Story />
      </div>
    ),
  ],
};

export const LongContent: Story = {
  args: {
    leftText:
      'Very Long Label That Demonstrates How The Component Handles Lengthy Text Content',
    rightText:
      'This is also a very long value that shows how the right side content behaves with extended text',
    wrapOnMobile: true,
  },
  decorators: [
    (Story) => (
      <div className="bg-neutral-900 p-6 max-w-md rounded">
        <Story />
      </div>
    ),
  ],
};

export const MultipleItems: Story = {
  render: () => (
    <div className="bg-neutral-900 p-6 max-w-md rounded space-y-0 divide-y divide-white/10">
      <ListItem leftText="Course Name" rightText="Bitcoin Fundamentals" />
      <ListItem leftText="Duration" rightText="2 hours" />
      <ListItem leftText="Difficulty" rightText="Beginner" />
      <ListItem leftText="Price" rightText="Free" />
      <ListItem leftText="Language" rightText="English" />
    </div>
  ),
};
