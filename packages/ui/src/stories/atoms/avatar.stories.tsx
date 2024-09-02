import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from '../../atoms/avatar.tsx';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Primary: Story = {
  args: {
    children: (
      <>
        <AvatarImage src={'src/stories/assets/discord.svg'} />
        <AvatarFallback>CN</AvatarFallback>
      </>
    ),
  },
};
