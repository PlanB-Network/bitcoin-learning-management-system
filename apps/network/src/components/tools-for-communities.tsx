import { cn } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import BlockTitle from './block-title.tsx';

type ToolsForCommunitiesProps = {
  className?: string;
};

export default function ToolsForCommunities({
  className,
}: ToolsForCommunitiesProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('', className)}>
      <BlockTitle
        text={t('academy.blockTitle4Text')}
        subtext={t('academy.blockTitle4Subtext')}
        direction="right"
      />
    </div>
  );
}
