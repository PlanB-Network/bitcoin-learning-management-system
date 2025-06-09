import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '#src/bases/button.tsx';

const variants = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'outlineWhite',
  'ghost',
  'transparent',
  'fakeDisabled',
  'flags',
  'carousel',
  'loginButton',
  'carouselDashboard',
] as const;

const sizes = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'flagsMobile',
  'carouselSize',
  'loginButton',
] as const;

const meta: Meta<typeof Button> = {
  title: 'Bases/button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content displayed inside the button.',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
    size: {
      control: { type: 'select' },
      options: sizes,
    },
    mode: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
      description: 'dark mode requires a `dark` class.',
    },
    rounded: {
      control: 'boolean',
    },
    glowing: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
      description: 'Becomes non-interactive.',
    },
    asChild: {
      control: 'boolean',
      table: {
        disable: true,
      },
    },
    className: {
      control: 'text',
    },
    onClick: {
      action: 'clicked',
      table: {
        disable: true,
      },
    },
  },
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'm',
    mode: 'light',
    rounded: false,
    glowing: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {},
};

export const AllVariants: Story = {
  render: (args) => (
    <>
      <div className="flex flex-wrap items-end gap-4 p-4">
        {variants.map((variant) => (
          <Button key={variant} {...args} mode="light" variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4 p-4 mt-4 rounded bg-[#333333]">
        {variants.map((variant) => (
          <Button key={variant} {...args} mode="dark" variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ))}
      </div>
    </>
  ),
  args: {
    children: 'Variant',
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4 p-4">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          {`Size ${size.toUpperCase()}`}
        </Button>
      ))}
    </div>
  ),
  args: {
    children: 'Button Size',
    variant: 'primary',
  },
};

export const Rounded: Story = {
  args: {
    rounded: true,
    children: 'Rounded',
    variant: 'primary',
  },
};

export const Glowing: Story = {
  args: {
    glowing: true,
    children: 'Glowing',
    variant: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
    variant: 'primary',
  },
};
