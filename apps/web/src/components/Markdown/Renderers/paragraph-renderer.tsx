import { cn } from '@blms/ui';
import { type VariantProps, cva } from 'class-variance-authority';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { VideoPlayerWrapper } from '#src/components/video-player.tsx';
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
  const { i18n } = useTranslation();

  const renderChild = async (child: React.ReactNode) => {
    if (typeof child === 'string') {
      if (child.includes(':::tradingview')) {
        const str = child
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

      if (child.includes(':::video')) {
        const planbVideoId = child.match(/id=([a-zA-Z0-9_-]+)/)?.[1] ?? '';
        if (planbVideoId) {
          return (
            <VideoPlayerWrapper
              key={planbVideoId}
              videoId={planbVideoId}
              language={i18n.language}
            />
          );
        }
      }

      return child;
    }
  };

  if (Array.isArray(children)) {
    return (
      <div className={cn(paragraphStyles({ intent }))}>
        {children.map((child, index) => (
          <React.Fragment
            key={typeof child === 'string' ? child : `child-${index}`}
          >
            {renderChild(child)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(paragraphStyles({ intent }))}>
      {renderChild(children)}
    </div>
  );
};
