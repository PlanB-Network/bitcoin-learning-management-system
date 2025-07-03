import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
} from 'react-icons/ri';
import { Button } from '../../bases/button.tsx';
import { customToast, ToastContainer } from '../../bases/toast.tsx';

const meta: Meta = {
  component: ToastContainer,
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <div className="relative w-[800px] min-h-60 h-auto p-4 bg-darkOrange-0 rounded-lg flex items-center justify-center">
      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {args.children}
      </div>
    </div>
  ),
  tags: ['autodocs'],
  title: 'Composites/toast',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Button
          onClick={() =>
            customToast('This is a primary toast.', { color: 'primary' })
          }
        >
          Show Primary Toast
        </Button>

        <Button
          onClick={() =>
            customToast('This is a warning toast!', {
              color: 'warning',
              icon: RiErrorWarningLine,
            })
          }
        >
          Show Warning Toast
        </Button>

        <Button
          onClick={() =>
            customToast('Operation successful!', {
              color: 'success',
              icon: RiCheckLine,
            })
          }
        >
          Show Success Toast
        </Button>

        <Button
          onClick={() =>
            customToast('A neutral informational message.', {
              color: 'neutral',
              icon: RiInformationLine,
            })
          }
        >
          Show Neutral Toast
        </Button>

        <div className="dark p-2 rounded-md bg-newBlack-2 flex justify-center">
          <Button
            onClick={() =>
              customToast('This is a dark mode primary toast.', {
                color: 'primary',
                mode: 'dark',
              })
            }
          >
            Show Dark Primary
          </Button>
        </div>
        <div className="dark p-2 rounded-md bg-newBlack-2 flex justify-center">
          <Button
            onClick={() =>
              customToast('This is a dark mode warning toast!', {
                color: 'warning',
                icon: RiErrorWarningLine,
                mode: 'dark',
              })
            }
          >
            Show Dark Warning
          </Button>
        </div>
        <div className="dark p-2 rounded-md bg-newBlack-2 flex justify-center">
          <Button
            onClick={() =>
              customToast('Dark mode operation successful!', {
                color: 'success',
                icon: RiCheckLine,
                mode: 'dark',
              })
            }
          >
            Show Dark Success
          </Button>
        </div>
        <div className="dark p-2 rounded-md bg-newBlack-2 flex justify-center">
          <Button
            onClick={() =>
              customToast('Dark mode informational message.', {
                color: 'neutral',
                icon: RiInformationLine,
                mode: 'dark',
              })
            }
          >
            Show Dark Neutral
          </Button>
        </div>

        <Button
          onClick={() =>
            customToast('Toast with custom close button.', {
              closeButton: true,
              color: 'neutral',
            })
          }
        >
          Show Toast with Close Button
        </Button>

        <Button
          onClick={() =>
            customToast('Click me to see an alert!', {
              color: 'success',
              onClick: () => alert('Toast Clicked!'),
              time: 7000,
            })
          }
        >
          Show Clickable Toast
        </Button>

        <Button
          onClick={() =>
            customToast('This toast will disappear quickly.', {
              color: 'primary',
              time: 2000,
            })
          }
        >
          Show Short Toast
        </Button>
      </>
    ),
  },
};
