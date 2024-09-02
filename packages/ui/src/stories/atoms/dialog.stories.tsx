import type { Meta, StoryObj } from '@storybook/react';

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../atoms/dialog.tsx';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Primary: Story = {
  args: {
    children: (
      <>
        <DialogHeader>
          <DialogTitle variant="orange">Title</DialogTitle>
          <DialogDescription className="hidden">Desc</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">Yo</div>
      </>
    ),
  },
};
