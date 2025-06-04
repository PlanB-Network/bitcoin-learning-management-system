import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/table.js';

const meta: Meta<typeof Table> = {
  title: 'Organisms/table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

const bitcoinBlocks = [
  {
    block: '#840,000',
    hash: '00000000000000000004e...3b1d',
    transactions: '4,000',
    minedBy: 'Foundry USA',
    reward: '6.25 BTC',
    timestamp: '2024-05-15 14:30 UTC',
  },
  {
    block: '#839,999',
    hash: '00000000000000000003a...2c9e',
    transactions: '3,850',
    minedBy: 'AntPool',
    reward: '6.25 BTC',
    timestamp: '2024-05-15 14:20 UTC',
  },
  {
    block: '#839,998',
    hash: '00000000000000000005b...1f7a',
    transactions: '4,120',
    minedBy: 'F2Pool',
    reward: '6.25 BTC',
    timestamp: '2024-05-15 14:10 UTC',
  },
  {
    block: '#839,997',
    hash: '00000000000000000001c...9d3f',
    transactions: '3,980',
    minedBy: 'ViaBTC',
    reward: '6.25 BTC',
    timestamp: '2024-05-15 14:00 UTC',
  },
  {
    block: '#839,996',
    hash: '00000000000000000006d...8a4e',
    transactions: '4,050',
    minedBy: 'Poolin',
    reward: '6.25 BTC',
    timestamp: '2024-05-15 13:50 UTC',
  },
];

export const Default: Story = {
  render: () => (
    <div className="w-[800px]">
      <Table>
        <TableCaption>
          A list of recent Bitcoin blocks mined on the network.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Block</TableHead>
            <TableHead>Hash</TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Mined By</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bitcoinBlocks.map((block) => (
            <TableRow key={block.block}>
              <TableCell className="font-medium">{block.block}</TableCell>
              <TableCell className="font-mono text-xs text-newGray-2">
                {block.hash}
              </TableCell>
              <TableCell>{block.transactions}</TableCell>
              <TableCell>{block.minedBy}</TableCell>
              <TableCell className="text-right font-medium text-darkOrange-5">
                {block.reward}
              </TableCell>
              <TableCell className="text-newGray-1 text-sm">
                {block.timestamp}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};
