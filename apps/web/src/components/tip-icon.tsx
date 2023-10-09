/// <reference types="vite-plugin-svgr/client" />

import { useTranslation } from 'react-i18next';

import DonateLightning from '../assets/icons/donate_lightning.svg?react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../atoms/Tooltip';

export const TipIcon = () => {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <DonateLightning />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-200" sideOffset={5} side="bottom">
          <p className="text-blue-800 ">{t('tutorials.details.tipTooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
