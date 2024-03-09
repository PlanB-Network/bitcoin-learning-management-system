import type { Meta, StoryObj } from '@storybook/react';

import { MenuElement } from './index.tsx';

const meta: Meta<typeof MenuElement> = {
  title: 'Components/MenuElement',
  component: MenuElement,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MenuElement>;

export const Primary: Story = {
  args: {},
};
