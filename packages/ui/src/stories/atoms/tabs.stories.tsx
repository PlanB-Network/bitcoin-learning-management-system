import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/tabs.tsx';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Primary: Story = {
  args: {
    defaultValue: 'tabone',
    className: 'max-w-[600px]',
    children: (
      <>
        <TabsList>
          <TabsTrigger value="tabone">One</TabsTrigger>
          <TabsTrigger value="tabtwo">Two</TabsTrigger>
          <TabsTrigger value="tabthree">Three</TabsTrigger>
        </TabsList>
        <TabsContent value="tabone">
          <p>Tab one content</p>
        </TabsContent>
        <TabsContent value="tabtwo">
          <p>Tab two content</p>
        </TabsContent>
        <TabsContent value="tabthree">
          <p>Tab three content</p>
        </TabsContent>
      </>
    ),
  },
};
