import type { Meta, StoryObj } from '@storybook/react-vite';
import { TbVideo } from 'react-icons/tb';
import { CollapsibleDropdown } from '#src/composites/Dropdown/collapsible-dropdown.tsx';

const variants = ['light', 'dark'] as const;

const meta: Meta<typeof CollapsibleDropdown> = {
  args: {
    children:
      'This is the collapsible content that can be expanded or collapsed by clicking the header.',
    className: '',
    defaultOpen: false,
    title: 'Frequently Asked Questions',
    variant: 'light',
  },
  argTypes: {
    children: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
    defaultOpen: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
  },
  component: CollapsibleDropdown,
  decorators: [
    (Story) => (
      <div className="w-[300px] md:w-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Dropdown/collapsible-dropdown',
};

export default meta;

type Story = StoryObj<typeof CollapsibleDropdown>;

export const Default: Story = {
  args: {},
};

export const DarkVariant: Story = {
  args: {
    title: 'Dark Theme Dropdown',
    variant: 'dark',
  },
};

export const WithVideoIcon: Story = {
  args: {
    children: 'This collapsible section includes a video icon.',
    icon: <TbVideo size={24} />,
    title: 'Video section',
  },
};

export const DefaultOpen: Story = {
  args: {
    children: 'This collapsible starts in an open state by default.',
    defaultOpen: true,
    title: 'Already Expanded',
  },
};

export const LongContent: Story = {
  args: {
    children: (
      <div>
        <h3>This is a longer content example</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <ul>
          <li>First important point</li>
          <li>Second important point</li>
          <li>Third important point</li>
        </ul>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    ),
    title: 'Detailed Information',
  },
};
