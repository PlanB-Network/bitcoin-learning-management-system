import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  TbCertificate,
  TbCertificateOff,
  TbFileCertificate,
} from 'react-icons/tb';
import {
  CategorySwitcher,
  CategorySwitcherBar,
} from '#src/bases/category-switcher.tsx';

const meta: Meta<typeof CategorySwitcher> = {
  title: 'Bases/category-switcher',
  component: CategorySwitcher,
  argTypes: {
    text: { control: 'text' },
    icon: { control: 'object' },
    isActive: { control: 'boolean' },
    size: { control: 'radio', options: ['s', 'm'] },
    onClick: { action: 'clicked' },
    inactiveBackgroundColor: { control: 'text' },
    className: { control: 'text' },
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CategorySwitcher>;

export const Default: Story = {
  args: {
    text: 'All',
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    text: 'Active Category',
    isActive: true,
  },
};

export const WithIcon: Story = {
  args: {
    text: 'Certificates',
    icon: TbCertificate,
    isActive: false,
  },
};

export const SmallSize: Story = {
  args: {
    text: 'Small Item',
    isActive: false,
    size: 's',
  },
};

export const CustomInactiveBg: Story = {
  args: {
    text: 'Custom BG',
    isActive: false,
    inactiveBackgroundColor: 'bg-neutral-50',
  },
};

export const InSwitcherBarControlled: StoryObj = {
  render: () => {
    const categories = [
      { text: 'All', icon: TbCertificate },
      { text: 'Completed', icon: TbFileCertificate },
      { text: 'Unavailable', icon: TbCertificateOff },
      { text: 'Pending' },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    return (
      <div className="bg-white p-4 w-full max-w-md">
        <CategorySwitcherBar>
          {categories.map((c, i) => (
            <CategorySwitcher
              // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
              key={i}
              text={c.text}
              icon={c.icon}
              isActive={i === activeIndex}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </CategorySwitcherBar>
      </div>
    );
  },
};

export const MultiSelect: StoryObj = {
  render: () => {
    const categories = [
      { text: 'Completed', icon: TbFileCertificate },
      { text: 'Unavailable', icon: TbCertificateOff },
      { text: 'Pending' },
    ];

    const [activeItems, setActiveItems] = useState<number[]>([0]);

    const toggle = (i: number) => {
      setActiveItems((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
      );
    };

    return (
      <div className="bg-white p-4 w-full max-w-md">
        <CategorySwitcherBar>
          {categories.map((c, i) => (
            <CategorySwitcher
              // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
              key={i}
              text={c.text}
              icon={c.icon}
              isActive={activeItems.includes(i)}
              onClick={() => toggle(i)}
            />
          ))}
        </CategorySwitcherBar>
      </div>
    );
  },
};
