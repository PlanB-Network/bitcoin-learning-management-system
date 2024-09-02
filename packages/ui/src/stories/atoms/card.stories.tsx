import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '../../atoms/card.tsx';

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    withPadding: true,
    image: 'src/stories/assets/discord.svg',
    children: (
      <>
        <p>Card content</p>
      </>
    ),
  },
};
