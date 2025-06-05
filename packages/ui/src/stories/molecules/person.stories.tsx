import type { Meta, StoryObj } from '@storybook/react-vite';
import { Person } from '#src/molecules/person.tsx';

const meta: Meta<typeof Person> = {
  title: 'Molecules/person',
  component: Person,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
    },
    job: {
      control: 'text',
    },
    picture: {
      control: 'text',
    },
  },
  args: {
    name: 'John Doe',
    job: 'Software Engineer',
    picture: 'https://placehold.co/80x80',
  },
};

export default meta;

type Story = StoryObj<typeof Person>;

export const Default: Story = {
  args: {},
};
