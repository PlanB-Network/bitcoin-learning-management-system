import { useTranslation } from 'react-i18next';

import { compose } from '../../../utils';

interface ResourceRateProps {
  rate: number;
}

export const ResourceRate = ({ rate }: ResourceRateProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-primary-800 mx-auto mb-2 w-max text-2xl font-semibold uppercase">
        {t('words.review')}
      </div>
      <div className="text-primary-800 mx-auto w-max text-sm font-light">
        {t('resources.publicGrade', { grade: rate.toFixed(1) })}
      </div>
      <div className="mt-3 flex flex-row justify-evenly space-x-5">
        {new Array(5)
          .fill(false)
          .fill(true, 0, Math.floor(rate))
          .map((value, index) => (
            <div
              key={index}
              className={compose(
                'w-6 h-6 rounded-sm border border-solid',
                value
                  ? 'border-transparent bg-secondary-400'
                  : 'bg-gray-100 border-gray-600'
              )}
            ></div>
          ))}
      </div>
    </div>
  );
};
