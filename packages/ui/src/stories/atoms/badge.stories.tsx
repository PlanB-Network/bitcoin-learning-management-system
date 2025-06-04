import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '#src/atoms/badge.tsx';

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: 'Atoms/badge',
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
    children: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['small', 'verySmall'],
      defaultValue: 'small',
    },
    variant: {
      control: 'select',
      options: ['darkOrange', 'lightOrange', 'darkMaroon'],
      defaultValue: 'darkOrange',
    },
    asChild: {
      control: 'boolean',
      defaultValue: false,
    },
    className: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const DefaultDarkOrangeSmall: Story = {
  name: 'Default (Dark Orange Small)',
  args: {
    children: 'Badge',
  },
};

export const VerySmallSize: Story = {
  name: 'Dark Orange Very Small',
  args: {
    children: 'Very Small',
    size: 'verySmall',
    variant: 'darkOrange',
  },
};

export const LightOrangeSmall: Story = {
  name: 'Light Orange Small',
  args: {
    children: 'Light Orange',
    variant: 'lightOrange',
    size: 'small',
  },
};

export const LightOrangeVerySmall: Story = {
  name: 'Light Orange Very Small',
  args: {
    children: 'VS Light Orange',
    variant: 'lightOrange',
    size: 'verySmall',
  },
};

export const DarkMaroonSmall: Story = {
  name: 'Dark Maroon Small',
  args: {
    children: 'Dark Maroon',
    variant: 'darkMaroon',
    size: 'small',
  },
};

export const DarkMaroonVerySmall: Story = {
  name: 'Dark Maroon Very Small',
  args: {
    children: 'VS Dark Maroon',
    variant: 'darkMaroon',
    size: 'verySmall',
  },
};

export const WithLongText: Story = {
  name: 'With Long Text',
  args: {
    children: 'This is a longer badge text',
    variant: 'lightOrange',
    size: 'small',
  },
};

export const AsChildLink: Story = {
  name: 'As Child (Link)',
  args: {
    asChild: true,
    variant: 'darkMaroon',
    size: 'small',
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
  },
};

export const WithCustomClass: Story = {
  name: 'With Custom Class',
  args: {
    children: 'Custom CSS',
    variant: 'darkOrange',
    size: 'small',
    className: 'opacity-75 rotate-3',
  },
};
