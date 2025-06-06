import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Calendar } from '../../bases/calendar.tsx';

const meta: Meta<typeof Calendar> = {
  title: 'Composites/calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
      description: 'The selection mode of the calendar.',
    },
    selected: {
      control: 'object',
      description: 'The selected date(s).',
    },
    onSelect: {
      action: 'date selected',
      description: 'Callback function when a date is selected.',
    },
    initialFocus: {
      control: 'boolean',
      description: 'Whether the calendar should have initial focus.',
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Whether to show days outside the current month.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the calendar is disabled.',
    },
  },
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
    selected: [
      new Date('2024-07-10'),
      new Date('2024-07-15'),
      new Date('2024-07-20'),
    ],
    month: new Date('2024-07-01'),
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
    mode: 'single',
    selected: new Date(),
    disabled: (date) => date.getDay() === 0 || date.getDay() === 6,
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
    mode: 'single',
    selected: new Date(),
    fromDate: new Date('2024-07-15'),
    month: new Date('2024-07-01'),
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
