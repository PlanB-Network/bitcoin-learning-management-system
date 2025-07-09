import type { Meta, StoryObj } from '@storybook/react-vite';
import { TbVideo } from 'react-icons/tb';
import { Toggle } from '#src/bases/toggle.tsx';

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  tags: ['autodocs'],
  title: 'Bases/toggle',
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const One: Story = {
  args: { children: <TbVideo /> },
};

export const Two: Story = {
  args: { children: 'Bla bla' },
};
