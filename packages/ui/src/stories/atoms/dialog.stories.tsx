import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '#src/atoms/button.tsx';
import {
  BasicModal,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#src/atoms/dialog.tsx';

const meta: Meta<typeof Dialog> = {
  title: 'Atoms/dialog',
  component: Dialog,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" size="m">
          Open Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Default Dialog</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title and description.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>You can add any content here.</p>
        </div>
        <DialogFooter>
          <Button variant="primary" size="s">
            Save changes
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" size="s">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  render: () => (
    <BasicModal
      trigger={
        <Button variant={'outline'} mode="light" size="m" type="button">
          Delete career profile
        </Button>
      }
      title="Are you sure you want to delete your career profile?"
      content={
        <p>
          This action cannot be undone.
          <br />
          All your career data will be permanently removed.
        </p>
      }
      showLogo={true}
    >
      <div className="!flex gap-4 md:!gap-[30px]">
        <DialogClose asChild>
          <Button variant="primary" size={'l'} className="!w-fit">
            Delete
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant="outline" size={'l'} className="w-fit">
            Cancel
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  ),
};

export const DialogWithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" size="m">
          Open Dialog (No Close Button)
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dialog Without Close Button</DialogTitle>
          <DialogDescription>
            No 'X' button in the top right corner.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="s">
              Custom Close Button
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DialogTitleVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="primary" size="m">
            Open Orange Title Dialog
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle variant="orange">Orange Title</DialogTitle>
            <DialogDescription>`orange` variant for title</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="s">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="primary" size="m">
            Open Black Title Dialog
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle variant="black">Black Title</DialogTitle>
            <DialogDescription>`black` variant for title</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="s">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const DialogWithLongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" size="m">
          Open Dialog (Long Content)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md h-[80vh]">
        <DialogHeader>
          <DialogTitle>Dialog with Scrollable Content</DialogTitle>
          <DialogDescription>
            Handles content that exceeds its maximum height.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <p key={i} className="mb-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="secondary" size="s">
              Close Dialog
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
