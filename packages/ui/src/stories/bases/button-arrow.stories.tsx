import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonWithArrow } from '#src/bases/button-arrow.tsx';

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

const meta: Meta<typeof ButtonWithArrow> = {
  args: {
    children: 'Click me',
    disabled: false,
    glowing: false,
    mode: 'light',
    rounded: false,
    size: 'm',
    variant: 'primary',
  },
  argTypes: {
    asChild: {
      control: 'boolean',
      table: {
        disable: true,
      },
    },
    children: {
      control: 'text',
      description: 'Content displayed inside the button.',
    },
    className: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
      description: 'Becomes non-interactive.',
    },
    glowing: {
      control: 'boolean',
    },
    mode: {
      control: { type: 'radio' },
      description: 'dark mode requires a `dark` class.',
      options: ['light', 'dark'],
    },
    onClick: {
      action: 'clicked',
      table: {
        disable: true,
      },
    },
    rounded: {
      control: 'boolean',
    },
    size: {
      control: { type: 'select' },
      options: sizes,
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
  },
  component: ButtonWithArrow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/button-arrow',
};

export default meta;

type Story = StoryObj<typeof ButtonWithArrow>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="group/arrow">
      <ButtonWithArrow {...args} />
    </div>
  ),
};

export const AllVariants: Story = {
  args: {
    children: 'Variant',
  },
  render: (args) => (
    <>
      <div className="flex flex-wrap items-end gap-4 p-4">
        {variants.map((variant) => (
          <div key={variant} className="group/arrow">
            <ButtonWithArrow {...args} mode="light" variant={variant}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </ButtonWithArrow>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4 p-4 mt-4 rounded bg-[#333333]">
        {variants.map((variant) => (
          <div key={variant} className="group/arrow">
            <ButtonWithArrow {...args} mode="dark" variant={variant}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </ButtonWithArrow>
          </div>
        ))}
      </div>
    </>
  ),
};

export const AllSizes: Story = {
  args: {
    children: 'Button Size',
    variant: 'primary',
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-4 p-4">
      {sizes.map((size) => (
        <div key={size} className="group/arrow">
          <ButtonWithArrow {...args} size={size}>
            {`Size ${size.toUpperCase()}`}
          </ButtonWithArrow>
        </div>
      ))}
    </div>
  ),
};

export const Rounded: Story = {
  args: {
    children: 'Rounded',
    rounded: true,
    variant: 'primary',
  },
  render: (args) => (
    <div className="group/arrow">
      <ButtonWithArrow {...args} />
    </div>
  ),
};

export const Glowing: Story = {
  args: {
    children: 'Glowing',
    glowing: true,
    variant: 'primary',
  },
  render: (args) => (
    <div className="group/arrow">
      <ButtonWithArrow {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
  render: (args) => (
    <div className="group/arrow">
      <ButtonWithArrow {...args} />
    </div>
  ),
};
