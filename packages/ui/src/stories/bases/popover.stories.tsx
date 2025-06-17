import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '#src/bases/button.js';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../bases/popover.js';
const meta: Meta<typeof Popover> = {
  title: 'Bases/popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  name: 'Default Popover',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="m">
          Open Popover
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-white">
        <div className="flex flex-col gap-2">
          <h4 className="font-medium leading-none">Popover</h4>
          <p className="text-sm text-muted-foreground">With some content</p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const PopoverTopAlignment: Story = {
  name: 'Popover (Top Alignment)',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="m">
          Open Popover (Top)
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-white" align="center" side="top">
        <p className="text-center text-sm">
          This popover is aligned to the top
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const PopoverRightAlignment: Story = {
  name: 'Popover (Right Alignment)',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="m">
          Open Popover (Right)
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-white" align="start" side="right">
        <p className="text-center text-sm">
          This popover is aligned to the right
        </p>
      </PopoverContent>
    </Popover>
  ),
};
