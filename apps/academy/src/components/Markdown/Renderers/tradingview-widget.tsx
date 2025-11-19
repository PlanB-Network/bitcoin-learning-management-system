import { useEffect, useRef } from 'react';

export const TradingViewWidget = ({
  symbol,
  height,
}: {
  symbol: string;
  height: number;
}) => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const currentContainer = container.current;
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `{
        "autosize": true,
        "height": "${height}",
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }`;
    currentContainer.innerHTML = '';
    currentContainer.appendChild(script);
  }, [symbol, height]);

  return <div ref={container} />;
};
