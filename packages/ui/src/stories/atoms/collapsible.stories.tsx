import type { Meta, StoryObj } from '@storybook/react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../atoms/collapsible.tsx';

const meta: Meta<typeof Collapsible> = {
  component: Collapsible,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Primary: Story = {
  args: {
    key: 'collapsKey',
    defaultOpen: false,
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
  },
};
