import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flag } from '#src/bases/Flag/flag.tsx';

const sizes = ['s', 'm', 'l', 'xl'] as const;
const gradients = ['', 'top-down', 'real-circular', 'real-linear'] as const;

const countryCodes = ['fr', 'it', 'ja'] as const;

const meta: Meta<typeof Flag> = {
  title: 'Bases/flag',
  component: Flag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    code: {
      control: 'text',
      description: 'Flag code (2 letters)',
    },
    size: {
      control: { type: 'select' },
      options: sizes,
    },
    gradient: {
      control: { type: 'select' },
      options: gradients,
    },
    hasBorder: {
      control: 'boolean',
    },
    hasDropShadow: {
      control: 'boolean',
    },
    hasBorderRadius: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
  args: {
    code: 'fr',
    size: 'l',
    gradient: '',
    hasBorder: false,
    hasDropShadow: false,
    hasBorderRadius: true,
  },
};

export default meta;

type Story = StoryObj<typeof Flag>;

export const Default: Story = {
  args: {
    code: 'fr',
  },
};

export const AllVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Size Variations</h3>
        <div className="flex items-end gap-4">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Flag code="fr" size={size} />
              <span className="text-sm text-gray-600">{size}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Gradient</h3>
        <div className="flex gap-4">
          {gradients.map((gradient) => (
            <div
              key={gradient || 'none'}
              className="flex flex-col items-center gap-2"
            >
              <Flag code="FR" size="l" gradient={gradient} />
              <span className="text-sm text-gray-600">
                {gradient || 'none'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Countries</h3>
        <div className="grid grid-cols-6 gap-4">
          {countryCodes.slice(0, 12).map((code) => (
            <div key={code} className="flex flex-col items-center gap-2">
              <Flag code={code} size="m" />
              <span className="text-xs text-gray-600">{code}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Style</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2">
            <Flag code="DE" size="l" />
            <span className="text-sm text-gray-600">Default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Flag code="DE" size="l" hasBorder />
            <span className="text-sm text-gray-600">With border</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Flag code="DE" size="l" hasDropShadow />
            <span className="text-sm text-gray-600">Drop shadow</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
