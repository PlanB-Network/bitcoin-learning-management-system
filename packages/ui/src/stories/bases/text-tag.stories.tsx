import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextTag } from '#src/bases/text-tag.tsx';

const meta: Meta<typeof TextTag> = {
  argTypes: {
    children: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
    mode: {
      control: 'select',
      defaultValue: 'light',
      options: ['light', 'light100', 'dark', 'dark100'],
    },
    size: {
      control: 'select',
      defaultValue: 'small',
      options: ['small', 'verySmall'],
    },
    variant: {
      control: 'select',
      defaultValue: 'grey',
      options: [
        'withoutFill',
        'grey',
        'orange',
        'green',
        'lightMaroon',
        'darkMaroon',
      ],
    },
  },
  component: TextTag,
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
  title: 'Bases/text-tag',
};

export default meta;
type Story = StoryObj<typeof TextTag>;

export const DefaultGreySmall: Story = {
  args: {
    children: 'Default Tag',
  },
};

export const VerySmallSize: Story = {
  args: {
    children: 'Very Small Tag',
    size: 'verySmall',
  },
};

export const WithoutFill: Story = {
  args: {
    children: 'Without Fill',
    variant: 'withoutFill',
  },
};

export const Orange: Story = {
  args: {
    children: 'Orange Tag',
    variant: 'orange',
  },
};

export const Green: Story = {
  args: {
    children: 'Green Tag',
    variant: 'green',
  },
};

export const LightMaroon: Story = {
  args: {
    children: 'Light Maroon',
    variant: 'lightMaroon',
  },
};

export const DarkMaroon: Story = {
  args: {
    children: 'Dark Maroon',
    variant: 'darkMaroon',
  },
};

export const GreyModeLight100: Story = {
  args: {
    children: 'Light100',
    mode: 'light100',
    size: 'small',
    variant: 'grey',
  },
  name: 'Grey Light100',
};

export const GreyModeDark: Story = {
  args: {
    children: 'Mode Dark',
    mode: 'dark',
    size: 'small',
    variant: 'grey',
  },
  name: 'Grey Dark',
};

export const GreyModeDark100: Story = {
  args: {
    children: 'Mode Dark100',
    mode: 'dark100',
    size: 'small',
    variant: 'grey',
  },
  name: 'Grey Dark100',
};

export const OrangeModeDark: Story = {
  args: {
    children: 'Orange Dark',
    mode: 'dark',
    size: 'small',
    variant: 'orange',
  },
  name: 'Orange Dark',
};

export const OrangeModeDark100: Story = {
  args: {
    children: 'Orange Dark100',
    mode: 'dark100',
    size: 'small',
    variant: 'orange',
  },
  name: 'Orange Dark100',
};
