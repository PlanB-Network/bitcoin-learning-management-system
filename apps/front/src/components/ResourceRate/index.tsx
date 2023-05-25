import { compose } from '../../utils';

interface RessourceRateProps {
  rate: number;
}

export const ResourceRate = ({ rate }: RessourceRateProps) => {
  return (
    <div>
      <div className="mx-auto mb-2 w-max text-2xl font-semibold uppercase text-primary-800">
        Review
      </div>
      <div className="mx-auto w-max text-sm font-thin text-primary-800">
        Public grade: {rate.toFixed(1)}/5
      </div>
      <div className="flex flex-row justify-evenly mt-3 space-x-5">
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
