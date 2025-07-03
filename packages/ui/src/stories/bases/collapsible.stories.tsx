import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#src/bases/collapsible.js';

const meta: Meta<typeof Collapsible> = {
  component: Collapsible,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Primary: Story = {
  args: {
    children: (
      <div key="collapsKey">
        <CollapsibleTrigger className="group flex justify-start text-left">
          <p className="italic">Click me</p>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="text-xs">Collapsed content</p>
        </CollapsibleContent>
      </div>
    ),
    defaultOpen: false,
    key: 'collapsKey',
  },
};
