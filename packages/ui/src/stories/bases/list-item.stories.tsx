import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListItem } from '#src/bases/ListItem/list-item.tsx';

const variants = ['dark', 'light', 'lightMaroon'] as const;

const meta: Meta<typeof ListItem> = {
  args: {
    className: '',
    hasIncreasedPadding: false,
    isDesktopOnly: false,
    isMobileOnly: false,
    leftText: 'Label',
    leftTextClassName: '',
    rightText: 'Value',
    rightTextClassName: '',
    variant: 'dark',
    wrapOnMobile: false,
  },
  argTypes: {
    className: {
      control: 'text',
    },
    hasIncreasedPadding: {
      control: 'boolean',
    },
    isDesktopOnly: {
      control: 'boolean',
    },
    isMobileOnly: {
      control: 'boolean',
    },
    leftText: {
      control: 'text',
    },
    leftTextClassName: {
      control: 'text',
    },
    rightText: {
      control: 'text',
    },
    rightTextClassName: {
      control: 'text',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
    wrapOnMobile: {
      control: 'boolean',
    },
  },
  component: ListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Bases/list-item',
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: {},
};

export const LightVariant: Story = {
  args: {
    leftText: 'Course Duration',
    rightText: '2 hours',
    variant: 'light',
  },
};

export const LightMaroonVariant: Story = {
  args: {
    leftText: 'Difficulty Level',
    rightText: 'Intermediate',
    variant: 'lightMaroon',
  },
};

export const WithIncreasedPadding: Story = {
  args: {
    hasIncreasedPadding: true,
    leftText: 'Course Price',
    rightText: '$29.99',
  },
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
};

export const LongContent: Story = {
  args: {
    leftText:
      'Very Long Label That Demonstrates How The Component Handles Lengthy Text Content',
    rightText:
      'This is also a very long value that shows how the right side content behaves with extended text',
  },
};

export const MultipleItems: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <ListItem
        leftText="Course Name"
        rightText="Bitcoin Fundamentals"
        variant="dark"
      />
      <ListItem leftText="Duration" rightText="2 hours" variant="dark" />
      <ListItem leftText="Difficulty" rightText="Beginner" variant="dark" />
      <ListItem leftText="Price" rightText="Free" variant="dark" />
      <ListItem leftText="Language" rightText="English" variant="dark" />
    </div>
  ),
};
