/// <reference types="vite-plugin-svgr/client" />

import { ReactNode } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../atoms/Tooltip';

interface TipIconProps {
  text: string;
  position: 'bottom' | 'left' | 'right' | 'top';
  children: ReactNode;
}

export const TooltipWithContent = ({
  text,
  position,
  children,
}: TipIconProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent className="bg-gray-200" sideOffset={5} side={position}>
          <p className="text-blue-800 ">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
