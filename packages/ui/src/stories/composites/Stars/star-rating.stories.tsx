import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarRating } from '#src/composites/Stars/star-rating.tsx';

const meta: Meta<typeof StarRating> = {
  title: 'Composites/Stars/star-rating',
  component: StarRating,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'number', min: 0, max: 10, step: 0.1 },
    },
    totalStars: {
      control: { type: 'number', min: 1, max: 10 },
    },
    fillColor: {
      control: { type: 'color' },
    },
    strokeColor: {
      control: { type: 'color' },
    },
    unfilledStrokeColor: {
      control: { type: 'color' },
    },
    starSize: {
      control: { type: 'number', min: 10, max: 100 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    rating: 4.5,
  },
};

export const AllVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Different ratings</h3>
        <div className="flex flex-col gap-2">
          <StarRating rating={5} />
          <StarRating rating={4.5} />
          <StarRating rating={3.7} />
          <StarRating rating={0} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Different sizes</h3>
        <div className="flex flex-col gap-2">
          <StarRating rating={4} starSize={20} />
          <StarRating rating={4} starSize={30} />
          <StarRating rating={4} starSize={40} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Different colors</h3>
        <div className="flex flex-col gap-2">
          <StarRating rating={4} />
          <StarRating
            rating={4}
            fillColor="#10B981"
            strokeColor="#10B981"
            unfilledStrokeColor="#10B98130"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Different total stars</h3>
        <div className="flex flex-col gap-2">
          <StarRating rating={7} totalStars={10} />
        </div>
      </div>
    </div>
  ),
};
