import type { Meta, StoryObj } from '@storybook/react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../atoms/tooltip.tsx';

const meta: Meta<typeof TooltipProvider> = {
  component: TooltipProvider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TooltipProvider>;

export const Primary: Story = {
  args: {
    delayDuration: 200,
    children: (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-orange-400">Tooltip top</span>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-200" sideOffset={5} side={'top'}>
          <p className="text-blue-800 ">Hey</p>
        </TooltipContent>
      </Tooltip>
    ),
  },
};
