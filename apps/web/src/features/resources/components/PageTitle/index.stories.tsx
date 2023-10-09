import type { Meta, StoryObj } from '@storybook/react';

import { PageTitle } from '.';

const meta: Meta<typeof PageTitle> = {
  title: 'Components/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageTitle>;

export const Primary: Story = {
  args: {},
};
