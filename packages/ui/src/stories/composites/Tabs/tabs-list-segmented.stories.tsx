import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabsListSegmented } from '#src/composites/Tabs/tabs-list-segmented.tsx';
import { Tabs } from '#src/composites/Tabs/tabs.tsx';

const variants = ['dark', 'light'] as const;

const meta: Meta<typeof TabsListSegmented> = {
  title: 'Composites/Tabs/tabs-list-segmented',
  component: TabsListSegmented,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context) => (
      <Tabs
        defaultValue={
          context.args.tabs?.find((tab) => tab.active)?.value ||
          context.args.tabs?.[0]?.value ||
          'default'
        }
      >
        <Story />
      </Tabs>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      control: 'object',
    },
    slice: {
      control: 'number',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
    children: {
      control: 'text',
    },
  },
  args: {
    tabs: [
      { value: 'overview', key: 'overview', text: 'Overview', active: true },
      {
        value: 'curriculum',
        key: 'curriculum',
        text: 'Curriculum',
        active: false,
      },
      {
        value: 'resources',
        key: 'resources',
        text: 'Resources',
        active: false,
      },
      { value: 'reviews', key: 'reviews', text: 'Reviews', active: false },
    ],
    variant: 'light',
    children: '',
  },
};

export default meta;

type Story = StoryObj<typeof TabsListSegmented>;

export const Default: Story = {
  args: {},
};

export const DarkVariant: Story = {
  args: {
    variant: 'dark',
    tabs: [
      { value: 'dashboard', key: 'dashboard', text: 'Dashboard', active: true },
      {
        value: 'analytics',
        key: 'analytics',
        text: 'Analytics',
        active: false,
      },
      { value: 'settings', key: 'settings', text: 'Settings', active: false },
    ],
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { value: 'basic', key: 'basic', text: 'Basic Info', active: true },
      { value: 'advanced', key: 'advanced', text: 'Advanced', active: false },
      {
        value: 'premium',
        key: 'premium',
        text: 'Premium Features',
        active: false,
        disabled: true,
      },
      { value: 'settings', key: 'settings', text: 'Settings', active: false },
    ],
  },
};

export const WithTextSlicing: Story = {
  args: {
    slice: 8,
    tabs: [
      {
        value: 'introduction',
        key: 'introduction',
        text: 'Introduction to Bitcoin',
        active: true,
      },
      {
        value: 'fundamentals',
        key: 'fundamentals',
        text: 'Fundamentals',
        active: false,
      },
      {
        value: 'advanced',
        key: 'advanced',
        text: 'Advanced Trading',
        active: false,
      },
      {
        value: 'security',
        key: 'security',
        text: 'Security Best Practices',
        active: false,
      },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { value: 'tab1', key: 'tab1', text: 'Overview', active: true },
      { value: 'tab2', key: 'tab2', text: 'Getting Started', active: false },
      { value: 'tab3', key: 'tab3', text: 'Curriculum', active: false },
      { value: 'tab4', key: 'tab4', text: 'Resources', active: false },
      { value: 'tab5', key: 'tab5', text: 'Assignments', active: false },
      { value: 'tab6', key: 'tab6', text: 'Discussion', active: false },
      { value: 'tab7', key: 'tab7', text: 'Reviews', active: false },
      { value: 'tab8', key: 'tab8', text: 'Certificates', active: false },
    ],
  },
};

export const LongTabNames: Story = {
  args: {
    tabs: [
      {
        value: 'course',
        key: 'course',
        text: 'Course Information and Overview',
        active: true,
      },
      {
        value: 'detailed',
        key: 'detailed',
        text: 'Detailed Curriculum with Learning Objectives',
        active: false,
      },
      {
        value: 'additional',
        key: 'additional',
        text: 'Additional Resources and Materials',
        active: false,
      },
    ],
  },
};

export const SingleTab: Story = {
  args: {
    tabs: [{ value: 'only', key: 'only', text: 'Only Tab', active: true }],
  },
};
