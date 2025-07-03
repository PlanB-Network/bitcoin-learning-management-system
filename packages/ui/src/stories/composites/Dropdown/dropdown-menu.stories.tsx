import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropdownMenu } from '#src/composites/Dropdown/dropdown-menu.tsx';

const variants = ['light', 'dark'] as const;

const meta: Meta<typeof DropdownMenu> = {
  args: {
    activeItem: 'English',
    className: '',
    itemsList: [
      { link: '/en', name: 'English' },
      { link: '/fr', name: 'French' },
      { link: '/es', name: 'Spanish' },
      { link: '/de', name: 'German' },
    ],
    maxWidth: 'max-w-[400px]',
    variant: 'dark',
  },
  argTypes: {
    activeItem: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
    itemsList: {
      control: 'object',
    },
    maxWidth: {
      control: 'text',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
  },
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Dropdown/dropdown-menu',
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {},
};

export const LightVariant: Story = {
  args: {
    activeItem: 'Settings',
    itemsList: [
      { link: '/profile', name: 'Profile' },
      { link: '/settings', name: 'Settings' },
      { link: '/notifications', name: 'Notifications' },
      { link: '/privacy', name: 'Privacy' },
    ],
    variant: 'light',
  },
};

export const WithClickHandlers: Story = {
  args: {
    activeItem: 'Dashboard',
    itemsList: [
      { name: 'Dashboard', onClick: () => alert('Dashboard clicked') },
      { name: 'Analytics', onClick: () => alert('Analytics clicked') },
      { name: 'Reports', onClick: () => alert('Reports clicked') },
      { name: 'Export', onClick: () => alert('Export clicked') },
    ],
  },
};

export const MixedItems: Story = {
  args: {
    activeItem: 'Home',
    itemsList: [
      { link: '/', name: 'Home' },
      { link: '/about', name: 'About' },
      { link: '/contact', name: 'Contact' },
      { name: 'Logout', onClick: () => alert('Logout clicked') },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    activeItem: 'Only Option',
    itemsList: [{ link: '/single', name: 'Only Option' }],
  },
};

export const EmptyDropdown: Story = {
  args: {
    activeItem: 'No Options',
    itemsList: [],
  },
};

export const LongItemNames: Story = {
  args: {
    activeItem: 'Very Long Option Name That Might Overflow',
    itemsList: [
      { link: '/long1', name: 'Very Long Option Name That Might Overflow' },
      {
        link: '/long2',
        name: 'Another Extremely Long Option Name For Testing',
      },
      { link: '/short', name: 'Short' },
      { link: '/medium', name: 'Medium Length Option' },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    activeItem: 'Option 1',
    itemsList: Array.from({ length: 15 }, (_, i) => ({
      link: `/option-${i + 1}`,
      name: `Option ${i + 1}`,
    })),
  },
};
