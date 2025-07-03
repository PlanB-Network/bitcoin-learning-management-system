import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { t } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import VideoSVG from '#src/assets/resources/video.svg?react';
import { VideoPlayerWrapper } from '#src/components/video-player.tsx';
import { TradingViewWidget } from './tradingview-widget.tsx';

const paragraphStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      blog: 'text-black mb-4 text-base tracking-wide md:text-justify text-start font-[450]',
      conference: 'desktop-subtitle1 text-newGray-1 font-[450]',
      default: 'text-blue-1000 body-16px font-[450]',
      general: 'text-blue-1000 text-base tracking-wide font-[450]',
      glossary:
        'mobile-body2 md:desktop-body1 text-white my-3 last:mb-0 font-[450]',
    },
  },
});

interface ParagraphRendererProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphStyles> {
  children?: React.ReactNode;
  className?: string;
  intent?: 'default' | 'blog' | 'conference' | 'general' | 'glossary';
  header: 'none' | 'logo' | 'text';
}
export const ParagraphRenderer: React.FC<ParagraphRendererProps> = (props) => {
  const { children, intent, header } = props;
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
            <div className="mb-8">
              {header === 'logo' && (
                <div className="flex items-center">
                  <VideoSVG className="mb-2 ml-4 size-10" />
                  <div className="ml-2">
                    <p className="text-lg font-medium text-blue-900">
                      {t('words.video')}
                    </p>
                  </div>
                </div>
              )}

              {header === 'text' && (
                <div className=" flex items-center">
                  <div className="ml-2">
                    <p className="text-lg font-medium text-blue-900">
                      {t('words.video')}
                    </p>
                  </div>
                </div>
              )}
              <VideoPlayerWrapper
                key={planbVideoId}
                videoId={planbVideoId}
                language={i18n.language}
              />
            </div>
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
