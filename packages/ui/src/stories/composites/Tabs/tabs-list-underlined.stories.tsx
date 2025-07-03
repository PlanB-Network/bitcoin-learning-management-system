import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '#src/composites/Tabs/tabs.tsx';
import { TabsListUnderlined } from '#src/composites/Tabs/tabs-list-underlined.tsx';

const variants = ['dark', 'light'] as const;
const sizes = ['s', 'm', 'l'] as const;

const meta: Meta<typeof TabsListUnderlined> = {
  args: {
    children: '',
    size: 'm',
    tabs: [
      { active: true, key: 'overview', text: 'Overview', value: 'overview' },
      {
        active: false,
        key: 'curriculum',
        text: 'Curriculum',
        value: 'curriculum',
      },
      {
        active: false,
        key: 'resources',
        text: 'Resources',
        value: 'resources',
      },
      { active: false, key: 'reviews', text: 'Reviews', value: 'reviews' },
    ],
    variant: 'light',
  },
  argTypes: {
    children: {
      control: 'text',
    },
    size: {
      control: { type: 'select' },
      options: sizes,
    },
    slice: {
      control: 'number',
    },
    tabs: {
      control: 'object',
    },
    variant: {
      control: { type: 'select' },
      options: variants,
    },
  },
  component: TabsListUnderlined,
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
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Composites/Tabs/tabs-list-underlined',
};

export default meta;

type Story = StoryObj<typeof TabsListUnderlined>;

export const Default: Story = {
  args: {},
};

export const DarkVariant: Story = {
  args: {
    tabs: [
      { active: true, key: 'dashboard', text: 'Dashboard', value: 'dashboard' },
      {
        active: false,
        key: 'analytics',
        text: 'Analytics',
        value: 'analytics',
      },
      { active: false, key: 'settings', text: 'Settings', value: 'settings' },
    ],
    variant: 'dark',
  },
};

export const SmallSize: Story = {
  args: {
    size: 's',
    tabs: [
      { active: true, key: 'home', text: 'Home', value: 'home' },
      { active: false, key: 'about', text: 'About', value: 'about' },
      { active: false, key: 'contact', text: 'Contact', value: 'contact' },
    ],
  },
};

export const LargeSize: Story = {
  args: {
    size: 'l',
    tabs: [
      { active: false, key: 'projects', text: 'Projects', value: 'projects' },
      { active: true, key: 'team', text: 'Team Members', value: 'team' },
      { active: false, key: 'reports', text: 'Reports', value: 'reports' },
    ],
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { active: true, key: 'basic', text: 'Basic Info', value: 'basic' },
      { active: false, key: 'advanced', text: 'Advanced', value: 'advanced' },
      {
        active: false,
        disabled: true,
        key: 'premium',
        text: 'Premium Features',
        value: 'premium',
      },
      { active: false, key: 'settings', text: 'Settings', value: 'settings' },
    ],
  },
};

export const WithTextSlicing: Story = {
  args: {
    slice: 8,
    tabs: [
      {
        active: true,
        key: 'introduction',
        text: 'Introduction to Bitcoin',
        value: 'introduction',
      },
      {
        active: false,
        key: 'fundamentals',
        text: 'Fundamentals',
        value: 'fundamentals',
      },
      {
        active: false,
        key: 'advanced',
        text: 'Advanced Trading',
        value: 'advanced',
      },
      {
        active: false,
        key: 'security',
        text: 'Security Best Practices',
        value: 'security',
      },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { active: true, key: 'tab1', text: 'Overview', value: 'tab1' },
      { active: false, key: 'tab2', text: 'Getting Started', value: 'tab2' },
      { active: false, key: 'tab3', text: 'Curriculum', value: 'tab3' },
      { active: false, key: 'tab4', text: 'Resources', value: 'tab4' },
      { active: false, key: 'tab5', text: 'Assignments', value: 'tab5' },
      { active: false, key: 'tab6', text: 'Discussion', value: 'tab6' },
      { active: false, key: 'tab7', text: 'Reviews', value: 'tab7' },
      { active: false, key: 'tab8', text: 'Certificates', value: 'tab8' },
    ],
  },
};

export const LongTabNames: Story = {
  args: {
    tabs: [
      {
        active: true,
        key: 'course',
        text: 'Course Information and Overview',
        value: 'course',
      },
      {
        active: false,
        key: 'detailed',
        text: 'Detailed Curriculum with Learning Objectives',
        value: 'detailed',
      },
      {
        active: false,
        key: 'additional',
        text: 'Additional Resources and Materials',
        value: 'additional',
      },
    ],
  },
};

export const SingleTab: Story = {
  args: {
    tabs: [{ active: true, key: 'only', text: 'Only Tab', value: 'only' }],
  },
};
