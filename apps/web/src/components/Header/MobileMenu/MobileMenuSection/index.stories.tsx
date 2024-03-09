import type { Meta, StoryObj } from '@storybook/react';

import { MobileMenuSection } from './index.tsx';

const meta: Meta<typeof MobileMenuSection> = {
  title: 'Components/MobileMenuSection',
  component: MobileMenuSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileMenuSection>;

export const Primary: Story = {
  args: {},
};
