import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '#src/bases/label.tsx';

const meta: Meta<typeof Label> = {
  component: Label,
  tags: ['autodocs'],
  title: 'Bases/Form/label',
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Primary: Story = {
  args: { children: 'Label content' },
};
