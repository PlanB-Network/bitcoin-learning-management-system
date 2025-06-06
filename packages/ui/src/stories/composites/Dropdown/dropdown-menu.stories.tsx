import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropdownMenu } from '#src/composites/Dropdown/dropdown-menu.tsx';

const variants = ['light', 'dark'] as const;

const meta: Meta<typeof DropdownMenu> = {
  title: 'Composites/Dropdown/dropdown-menu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    activeItem: {
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
    className: {
      control: 'text',
    },
  },
  args: {
    activeItem: 'English',
    itemsList: [
      { name: 'English', link: '/en' },
      { name: 'French', link: '/fr' },
      { name: 'Spanish', link: '/es' },
      { name: 'German', link: '/de' },
    ],
    maxWidth: 'max-w-[400px]',
    variant: 'dark',
    className: '',
  },
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {},
};

export const LightVariant: Story = {
  args: {
    variant: 'light',
    activeItem: 'Settings',
    itemsList: [
      { name: 'Profile', link: '/profile' },
      { name: 'Settings', link: '/settings' },
      { name: 'Notifications', link: '/notifications' },
      { name: 'Privacy', link: '/privacy' },
    ],
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
      { name: 'Home', link: '/' },
      { name: 'About', link: '/about' },
      { name: 'Contact', link: '/contact' },
      { name: 'Logout', onClick: () => alert('Logout clicked') },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    activeItem: 'Only Option',
    itemsList: [{ name: 'Only Option', link: '/single' }],
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
      { name: 'Very Long Option Name That Might Overflow', link: '/long1' },
      {
        name: 'Another Extremely Long Option Name For Testing',
        link: '/long2',
      },
      { name: 'Short', link: '/short' },
      { name: 'Medium Length Option', link: '/medium' },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    activeItem: 'Option 1',
    itemsList: Array.from({ length: 15 }, (_, i) => ({
      name: `Option ${i + 1}`,
      link: `/option-${i + 1}`,
    })),
  },
};
