import { cn } from '@blms/ui';
import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';
import { TradingViewWidget } from './tradingview-widget.tsx';

const paragraphStyles = cva('text-base tracking-wide', {
  variants: {
    intent: {
      default: 'text-blue-1000 body-16px',
      blog: 'text-black mb-4 text-base tracking-wide md:text-justify text-start',
      conference: 'desktop-subtitle1 text-newGray-1',
      general: 'text-blue-1000 text-base tracking-wide',
      glossary: 'mobile-body2 md:desktop-body1 text-white my-3 last:mb-0',
    },
  },
  defaultVariants: {
    intent: 'default',
  },
});

interface ParagraphRendererProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphStyles> {
  children?: React.ReactNode;
  className?: string;
  intent?: 'default' | 'blog' | 'conference' | 'general' | 'glossary';
}

export const ParagraphRenderer: React.FC<ParagraphRendererProps> = (props) => {
  const { children, intent } = props;

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
      return null;
    }
  }

  if (
    Array.isArray(children) &&
    children.length === 1 &&
    typeof children[0] === 'string'
  ) {
    return <p className={cn(paragraphStyles({ intent }))}>{children}</p>;
  }

  return <div className={cn(paragraphStyles({ intent }))}>{children}</div>;
};
