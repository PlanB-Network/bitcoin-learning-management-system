import type { Meta, StoryObj } from '@storybook/react-vite';
import { TbCircleCheck, TbClock, TbInfoCircle } from 'react-icons/tb';
import { Banner, BannerDescription, BannerTitle } from '#src/bases/banner.tsx';

const meta: Meta<typeof Banner> = {
  title: 'Bases/banner',
  component: Banner,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['success', 'info', 'inprogress'],
    },
    icon: {
      control: 'object',
    },
    className: { control: 'text' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Banner>;

export const Success: Story = {
  args: {
    variant: 'success',
    icon: <TbCircleCheck size={24} />,
    children: (
      <>
        <BannerTitle>Congratulations! 🎉</BannerTitle>
        <BannerDescription>
          You have successfully completed this step.
        </BannerDescription>
      </>
    ),
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    icon: <TbInfoCircle size={24} />,
    children: (
      <>
        <BannerTitle>Useful Information</BannerTitle>
        <BannerDescription>
          This is not critical, but you might want to read it carefully.
        </BannerDescription>
      </>
    ),
  },
};

export const InProgress: Story = {
  args: {
    variant: 'inprogress',
    icon: <TbClock size={24} />,
    children: (
      <>
        <BannerTitle>Still in progress…</BannerTitle>
        <BannerDescription>
          We're working hard on this. Check back later.
        </BannerDescription>
      </>
    ),
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: 'info',
    children: (
      <>
        <BannerTitle>No icon here</BannerTitle>
        <BannerDescription>Simple and clean banner layout.</BannerDescription>
      </>
    ),
  },
};
