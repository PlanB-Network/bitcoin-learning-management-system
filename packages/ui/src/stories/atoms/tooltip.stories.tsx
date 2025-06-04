import type { Meta, StoryObj } from '@storybook/react-vite';

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
    delayDuration: 100,
    children: (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-darkOrange-5">Tooltip top</span>
        </TooltipTrigger>
        <TooltipContent sideOffset={5} side={'top'}>
          <p>Hey</p>
        </TooltipContent>
      </Tooltip>
    ),
  },
};
