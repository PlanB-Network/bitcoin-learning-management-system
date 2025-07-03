import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Calendar } from '../../bases/calendar.tsx';

const meta: Meta<typeof Calendar> = {
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the calendar is disabled.',
    },
    initialFocus: {
      control: 'boolean',
      description: 'Whether the calendar should have initial focus.',
    },
    mode: {
      control: 'select',
      description: 'The selection mode of the calendar.',
      options: ['single', 'multiple', 'range'],
    },
    onSelect: {
      action: 'date selected',
      description: 'Callback function when a date is selected.',
    },
    selected: {
      control: 'object',
      description: 'The selected date(s).',
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Whether to show days outside the current month.',
    },
  },
  component: Calendar,
  tags: ['autodocs'],
  title: 'Composites/calendar',
};

export default meta;

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(args.selected as Date);
    return (
      <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
    );
  },
};

export const MultipleDates: Story = {
  args: {
    mode: 'multiple',
    month: new Date('2024-07-01'),
    selected: [
      new Date('2024-07-10'),
      new Date('2024-07-15'),
      new Date('2024-07-20'),
    ],
  },
  render: (args) => {
    const [dates, setDates] = useState<Date[] | undefined>(
      args.selected as Date[],
    );
    return (
      <Calendar
        {...args}
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        month={new Date('2024-07-01')}
      />
    );
  },
};

export const DisabledDays: Story = {
  args: {
    disabled: (date) => date.getDay() === 0 || date.getDay() === 6,
    mode: 'single',
    selected: new Date(),
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(args.selected as Date);
    return (
      <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
    );
  },
};

export const FromSpecificDate: Story = {
  args: {
    fromDate: new Date('2024-07-15'),
    mode: 'single',
    month: new Date('2024-07-01'),
    selected: new Date(),
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(args.selected as Date);
    return (
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={setDate}
        month={new Date('2024-07-01')}
      />
    );
  },
};

export const ToSpecificDate: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
    toDate: new Date('2024-07-15'),
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(args.selected as Date);
    return (
      <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
    );
  },
};
