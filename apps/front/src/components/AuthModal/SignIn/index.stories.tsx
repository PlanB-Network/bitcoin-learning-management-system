import type { Meta, StoryObj } from '@storybook/react';

import { SignIn } from '.';

const meta: Meta<typeof SignIn> = {
  title: 'Components/SignIn',
  component: SignIn,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SignIn>;

export const Primary: Story = {
  args: {},
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/foyvlfIOyL88zXCZXSQbzK/DecouvreBitcoin?type=design&node-id=917-51309&t=GXxz8Cp3DK7QXiOu-4',
    },
  },
};
