import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { VideoSelector } from '#src/components/video-selector.tsx';
import { TradingViewWidget } from './tradingview-widget.tsx';

const paragraphStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      conference: 'desktop-subtitle1 text-neutral-500',
      default: 'text-blue-950 body-16px',
      general: 'text-blue-950 text-base tracking-wide',
      glossary: 'mobile-body2 md:desktop-body1 text-black my-3 last:mb-0',
    },
  },
});

interface ParagraphRendererProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphStyles> {
  children?: React.ReactNode;
  className?: string;
  intent?: 'default' | 'conference' | 'general' | 'glossary';
  header: 'none' | 'logo' | 'text';
}
export const ParagraphRenderer: React.FC<ParagraphRendererProps> = (props) => {
  const { children, intent, header } = props;
  const { i18n } = useTranslation();

  const renderChild = (child: React.ReactNode) => {
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
            <VideoSelector
              key={planbVideoId}
              videoId={planbVideoId}
              language={i18n.language}
              header={header}
            />
          );
        }
      }
    }
    return child;
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
