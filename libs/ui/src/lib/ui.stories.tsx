import type { Meta, StoryObj } from '@storybook/react';
import { Ui } from './ui';

const meta: Meta<typeof Ui> = {
  component: Ui,
  title: 'Ui',
};
export default meta;
type Story = StoryObj<typeof Ui>;

export const Primary = {
  args: {},
};
