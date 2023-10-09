import type { Meta, StoryObj } from '@storybook/react';

import { Contributor } from '.';

const meta: Meta<typeof Contributor> = {
  title: 'Components/Contributor',
  component: Contributor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Contributor>;

export const Primary: Story = {
  args: {},
};
