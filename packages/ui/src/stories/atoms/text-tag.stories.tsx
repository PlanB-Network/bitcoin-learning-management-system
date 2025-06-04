import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextTag } from '#src/atoms/text-tag.tsx';

const meta: Meta<typeof TextTag> = {
  component: TextTag,
  title: 'Atoms/text-tag',
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
      options: [
        'withoutFill',
        'grey',
        'orange',
        'green',
        'lightMaroon',
        'darkMaroon',
      ],
      defaultValue: 'grey',
    },
    mode: {
      control: 'select',
      options: ['light', 'light100', 'dark', 'dark100'],
      defaultValue: 'light',
    },
    className: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
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
  name: 'Grey Light100',
  args: {
    children: 'Light100',
    variant: 'grey',
    size: 'small',
    mode: 'light100',
  },
};

export const GreyModeDark: Story = {
  name: 'Grey Dark',
  args: {
    children: 'Mode Dark',
    variant: 'grey',
    size: 'small',
    mode: 'dark',
  },
};

export const GreyModeDark100: Story = {
  name: 'Grey Dark100',
  args: {
    children: 'Mode Dark100',
    variant: 'grey',
    size: 'small',
    mode: 'dark100',
  },
};

export const OrangeModeDark: Story = {
  name: 'Orange Dark',
  args: {
    children: 'Orange Dark',
    variant: 'orange',
    size: 'small',
    mode: 'dark',
  },
};

export const OrangeModeDark100: Story = {
  name: 'Orange Dark100',
  args: {
    children: 'Orange Dark100',
    variant: 'orange',
    size: 'small',
    mode: 'dark100',
  },
};
