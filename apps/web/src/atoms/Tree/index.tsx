import { css } from '@emotion/css';
import * as React from 'react';

import TreeNode, { TreeNodeProps } from './TreeNode';

type LineStyle = 'dashed' | 'dotted' | 'double' | 'solid' | string;

export interface TreeProps {
  label: TreeNodeProps['label'];
  lineHeight?: string;
  lineWidth?: string;
  lineColor?: string;
  lineStyle?: LineStyle;
  lineBorderRadius?: string;
  nodePadding?: string;
  children: TreeNodeProps['children'];
}

function Tree({
  children,
  label,
  lineHeight = '20px',
  lineWidth = '1px',
  lineColor = 'black',
  nodePadding = '5px',
  lineStyle = 'solid',
  lineBorderRadius = '5px',
}: TreeProps) {
  return (
    <ul
      className={css`
        padding-inline-start: 0;
        margin: 0;
        display: flex;

        --line-height: ${lineHeight};
        --line-width: ${lineWidth};
        --line-color: ${lineColor};
        --line-border-radius: ${lineBorderRadius};
        --line-style: ${lineStyle};
        --node-padding: ${nodePadding};

        --tree-line-height: var(--line-height);
        --tree-line-width: var(--line-width);
        --tree-line-color: var(--line-color);
        --tree-line-border-radius: var(--line-border-radius);
        --tree-node-line-style: var(--line-style);
        --tree-node-padding: var(--node-padding);
      `}
    >
      <TreeNode label={label}>{children}</TreeNode>
    </ul>
  );
}

export default Tree;
