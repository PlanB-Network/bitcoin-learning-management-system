import { css, cx } from '@emotion/css';
import * as React from 'react';
import type { ReactNode } from 'react';

export interface TreeNodeProps {
  label: React.ReactNode;
  className?: string;
  children?: ReactNode;
  groupName?: string;
}

const verticalLine = css`
  content: '';
  position: absolute;
  top: 0;
  height: calc(var(--tree-line-height));
  box-sizing: border-box;
`;

const childrenContainer = css`
  display: flex;
  padding-inline-start: 0;
  margin: 0;
  padding-top: var(--tree-line-height);
  position: relative;

  ::before {
    ${verticalLine};
    left: calc(50% - calc(var(--tree-line-width) / 2));
    width: 0;
    border-left: var(--tree-line-width) var(--tree-node-line-style)
      var(--tree-line-color);
  }

  li:last-child:not(:only-child) > ul {
    ::before {
      left: calc(50% - calc(var(--tree-line-width) * 1.5));
    }
  }
`;

const node = css`
  flex: auto;
  text-align: center;
  list-style-type: none;
  position: relative;
  padding: var(--tree-line-height) var(--tree-node-padding) 0
    var(--tree-node-padding);
`;

const nodeLines = css`
  ::before,
  ::after {
    ${verticalLine};
    right: 50%;
    width: 50%;
    left: calc(-1 / 2 * var(--tree-line-width));
    border-top: var(--tree-line-width) var(--tree-node-line-style)
      var(--tree-line-color);
  }
  ::after {
    left: calc(50% - calc(var(--tree-line-width) / 2));
    border-left: var(--tree-line-width) var(--tree-node-line-style)
      var(--tree-line-color);
  }

  :only-of-type {
    padding: 0;
    ::after,
    :before {
      display: none;
    }
  }

  :first-of-type {
    ::before {
      border: 0 none;
    }
    ::after {
      border-radius: var(--tree-line-border-radius) 0 0 0;
    }
  }

  :last-of-type {
    ::before {
      border-right: var(--tree-line-width) var(--tree-node-line-style)
        var(--tree-line-color);
      border-radius: 0 var(--tree-line-border-radius) 0 0;
    }
    ::after {
      border: 0 none;
    }
  }
`;

function TreeNode({ children, label, className, groupName }: TreeNodeProps) {
  return (
    <li className={cx(node, nodeLines, className, 'relative')}>
      {groupName && (
        <span
          className={cx(
            'absolute -top-4 xl:-top-6 left-1/2 -translate-x-1/2 text-white text-[9px] xl:text-base font-semibold ',
            groupName === 'LN' && 'left-[60%]',
          )}
        >
          {groupName}
        </span>
      )}
      {label}
      {React.Children.count(children) > 0 && (
        <ul className={childrenContainer}>{children}</ul>
      )}
    </li>
  );
}

export default TreeNode;
