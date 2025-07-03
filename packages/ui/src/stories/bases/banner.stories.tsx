import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner, BannerDescription, BannerTitle } from '#src/bases/banner.tsx';

const meta: Meta<typeof Banner> = {
  component: Banner,
  tags: ['autodocs'],
  title: 'Bases/banner',
};

export default meta;

type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Banner variant="success">
          <BannerTitle>
            Congratulations! You have been selected to bla bla bla!
          </BannerTitle>
          <BannerDescription>You are the best.</BannerDescription>
        </Banner>
      </>
    ),
    variant: 'success',
  },
};
