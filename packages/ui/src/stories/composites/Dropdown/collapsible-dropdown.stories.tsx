import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsibleDropdown } from '#src/composites/Dropdown/collapsible-dropdown.tsx';

const variants = ['light', 'dark'] as const;
const types = ['info', 'default'] as const;

const meta: Meta<typeof CollapsibleDropdown> = {
  title: 'Composites/Dropdown/collapsible-dropdown',
  component: CollapsibleDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    children: {
      control: 'text',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
    className: {
      control: 'text',
    },
    defaultOpen: {
      control: 'boolean',
    },
    type: {
      control: { type: 'select' },
      options: types,
    },
  },
  args: {
    title: 'Frequently Asked Questions',
    children:
      'This is the collapsible content that can be expanded or collapsed by clicking the header.',
    variant: 'light',
    className: '',
    defaultOpen: false,
    type: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof CollapsibleDropdown>;

export const Default: Story = {
  args: {},
};

export const DarkVariant: Story = {
  args: {
    variant: 'dark',
    title: 'Dark Theme Dropdown',
  },
};

export const WithInfoIcon: Story = {
  args: {
    title: 'Important Information',
    type: 'info',
    children:
      'This collapsible section includes an info icon to draw attention to important content.',
  },
};

export const DefaultOpen: Story = {
  args: {
    title: 'Already Expanded',
    defaultOpen: true,
    children: 'This collapsible starts in an open state by default.',
  },
};

export const LongContent: Story = {
  args: {
    title: 'Detailed Information',
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
  },
};
