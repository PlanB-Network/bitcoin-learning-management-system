import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListItem } from '#src/bases/ListItem/list-item.tsx';

const variants = ['dark', 'light', 'lightMaroon'] as const;

const meta: Meta<typeof ListItem> = {
  title: 'Bases/list-item',
  component: ListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    leftText: {
      control: 'text',
    },
    rightText: {
      control: 'text',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
    isMobileOnly: {
      control: 'boolean',
    },
    isDesktopOnly: {
      control: 'boolean',
    },
    wrapOnMobile: {
      control: 'boolean',
    },
    hasIncreasedPadding: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
    rightTextClassName: {
      control: 'text',
    },
    leftTextClassName: {
      control: 'text',
    },
  },
  args: {
    leftText: 'Label',
    rightText: 'Value',
    variant: 'dark',
    isMobileOnly: false,
    isDesktopOnly: false,
    wrapOnMobile: false,
    hasIncreasedPadding: false,
    className: '',
    rightTextClassName: '',
    leftTextClassName: '',
  },
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: {},
};

export const LightVariant: Story = {
  args: {
    variant: 'light',
    leftText: 'Course Duration',
    rightText: '2 hours',
  },
};

export const LightMaroonVariant: Story = {
  args: {
    variant: 'lightMaroon',
    leftText: 'Difficulty Level',
    rightText: 'Intermediate',
  },
};

export const WithIncreasedPadding: Story = {
  args: {
    leftText: 'Course Price',
    rightText: '$29.99',
    hasIncreasedPadding: true,
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
