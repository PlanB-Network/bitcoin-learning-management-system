import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '#src/composites/segmented-control.tsx';

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Bases/segmented-control',
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: (_args) => (
    <SegmentedControl variant="outline" defaultValue={'two'}>
      <SegmentedControlItem value={'one'} key={'one'}>
        Long object one
      </SegmentedControlItem>
      <SegmentedControlItem value={'two'} key={'two'}>
        Object two
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};
