import { Card } from '../../atoms/Card';
import { Contributor } from '../Contributor';
import { ResourceRate } from '../ResourceRate';

interface ResourceReviewProps {
  comments: { content: string }[];
}

export const ResourceReview = () => {
  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ResourceRate rate={4.2} />

      <Card>
        <div className="flex flex-row">
          <div className="mr-6">
            <Contributor
              contributor={{
                username: 'Asi0',
                title: 'Bitcoiner',
                image:
                  'https://s3-alpha-sig.figma.com/img/f78f/1e1b/31b02829439b7d99accf532e11433adb?Expires=1684108800&Signature=XX34dFwoAxGVmh2oqiWSHvy0Ib4cv63pHM3I-ZTobT~DupI42GWVAUjhGpeC5~hRPa~cT-QHeLmk1-plXSvuu55v29uy7bv80l6xo4OLKc4HgFKSoRh9-fOiA~SE5Hb8bcq4flhELEQhfLhKmeF8fykdrNmEtsYB0VlR~C8iIB80ghRWIGzko4lE0VqOeOg9nXh8PMBtLC7DEwtE2XlqtohPOD-htwnMjkmjUn~wKYPfw04N7o8nwDM7KzjsEKxCyb~qpPr899vKVy6Mame9wBoUX83ESzgE~xCgLduQI~4t77UTDXjxG5Qkdsvm4no7ec0oamB0fHKaTwPoViiZbA__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
              }}
            />
          </div>

          <div className="flex flex-col flex-1">
            <h5 className="mb-4 leading-tight border-b border-gray-200 border-solid">
              Best book to learn about Bitcoin
            </h5>
            <p className="text-xs line-clamp-4 text-ellipsis">
              Thanks to this, I have been able to complete a battle in my sixth
              novel and nearly write thirty pages in under three days. Thank you
              so much for this truly amazing mix!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
