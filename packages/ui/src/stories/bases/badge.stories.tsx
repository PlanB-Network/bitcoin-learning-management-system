import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '#src/bases/badge.tsx';

const meta: Meta<typeof Badge> = {
  argTypes: {
    asChild: {
      control: 'boolean',
      defaultValue: false,
    },
    children: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
    size: {
      control: 'select',
      defaultValue: 'small',
      options: ['small', 'verySmall'],
    },
    variant: {
      control: 'select',
      defaultValue: 'darkOrange',
      options: ['darkOrange', 'lightOrange', 'darkMaroon'],
    },
  },
  component: Badge,
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
  title: 'Bases/badge',
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const DefaultDarkOrangeSmall: Story = {
  args: {
    children: 'Badge',
  },
  name: 'Default (Dark Orange Small)',
};

export const VerySmallSize: Story = {
  args: {
    children: 'Very Small',
    size: 'verySmall',
    variant: 'darkOrange',
  },
  name: 'Dark Orange Very Small',
};

export const LightOrangeSmall: Story = {
  args: {
    children: 'Light Orange',
    size: 'small',
    variant: 'lightOrange',
  },
  name: 'Light Orange Small',
};

export const LightOrangeVerySmall: Story = {
  args: {
    children: 'VS Light Orange',
    size: 'verySmall',
    variant: 'lightOrange',
  },
  name: 'Light Orange Very Small',
};

export const DarkMaroonSmall: Story = {
  args: {
    children: 'Dark Maroon',
    size: 'small',
    variant: 'darkMaroon',
  },
  name: 'Dark Maroon Small',
};

export const DarkMaroonVerySmall: Story = {
  args: {
    children: 'VS Dark Maroon',
    size: 'verySmall',
    variant: 'darkMaroon',
  },
  name: 'Dark Maroon Very Small',
};

export const WithLongText: Story = {
  args: {
    children: 'This is a longer badge text',
    size: 'small',
    variant: 'lightOrange',
  },
  name: 'With Long Text',
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
    children: (
      <a
        href="https://planb.network"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        Link Badge
      </a>
    ),
    size: 'small',
    variant: 'darkMaroon',
  },
  name: 'As Child (Link)',
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom CSS',
    className: 'opacity-75 rotate-3',
    size: 'small',
    variant: 'darkOrange',
  },
  name: 'With Custom Class',
};
