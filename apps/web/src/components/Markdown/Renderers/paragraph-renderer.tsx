import type React from 'react';
import { TradingViewWidget } from './tradingview-widget.tsx';

export const ParagraphRenderer: React.FC<React.ComponentProps<'p'>> = (
  props,
) => {
  const { children } = props;
  if (typeof children === 'string') {
    if (children.includes(':::tradingview')) {
      const str = children
        .replace(':::tradingview', '')
        .replace(':::', '')
        .trim();
      const symbol = str.match(/SYMBOL=([A-Z]+)/)?.[1] ?? 'BTCUSD';
      const height = Number.parseInt(
        str.match(/HEIGHT=(\d+)/)?.[1] ?? '500',
        10,
      );

      return <TradingViewWidget symbol={symbol} height={height} />;
    }
    if (children.includes(':::video')) {
      return <></>;
    }
  }

  if (
    Array.isArray(children) &&
    children.length === 1 &&
    typeof children[0] === 'string'
  ) {
    return <p className="text-blue-1000 body-16px">{children}</p>;
  }

  return <div className="text-blue-1000 body-16px">{children}</div>;
};
