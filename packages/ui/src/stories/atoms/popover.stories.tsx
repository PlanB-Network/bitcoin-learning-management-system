import type { Meta, StoryObj } from '@storybook/react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../atoms/popover.tsx';

const meta: Meta<typeof Popover> = {
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Primary: Story = {
  args: {
    open: true,
    children: (
      <>
        <PopoverTrigger asChild>
          <p>Show</p>
        </PopoverTrigger>
        <PopoverContent className="">
          <div>Content</div>
        </PopoverContent>
      </>
    ),
  },
};
