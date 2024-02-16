import type { Meta, StoryObj } from '@storybook/react';

import { MobileMenuSubSection } from './index.tsx';

const meta: Meta<typeof MobileMenuSubSection> = {
  title: 'Components/MobileMenuSubSection',
  component: MobileMenuSubSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileMenuSubSection>;

export const Primary: Story = {
  args: {},
};
