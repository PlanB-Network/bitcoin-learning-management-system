import type { Meta, StoryObj } from '@storybook/react-vite';
import { Person } from '#src/composites/person.tsx';

const meta: Meta<typeof Person> = {
  args: {
    job: 'Software Engineer',
    name: 'John Doe',
    picture: 'https://placehold.co/80x80',
  },
  argTypes: {
    job: {
      control: 'text',
    },
    name: {
      control: 'text',
    },
    picture: {
      control: 'text',
    },
  },
  component: Person,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/person',
};

export default meta;

type Story = StoryObj<typeof Person>;

export const Default: Story = {
  args: {},
};
