import type { Meta, StoryObj } from '@storybook/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/select.js';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Stories/form/select',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Primary: Story = {
  args: {
    children: (
      <>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a professor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'1'}>Prof 1</SelectItem>
          <SelectItem value={'2'}>Prof 2</SelectItem>
          <SelectItem value={'3'}>Prof 3</SelectItem>
        </SelectContent>
      </>
    ),
  },
};
