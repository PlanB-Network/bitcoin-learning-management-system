import type { Meta, StoryObj } from '@storybook/react';

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
          <TabsTrigger
            value="tabone"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            One
          </TabsTrigger>
          <TabsTrigger
            value="tabtwo"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            Two
          </TabsTrigger>
          <TabsTrigger
            value="tabthree"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            Three
          </TabsTrigger>
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
