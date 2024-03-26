import { Button } from '../../../atoms/Button/index.tsx';
import { Anchor } from '../../../atoms/Link/index.tsx';
import Flag from '../../../atoms/Flag/index.tsx';

export const EventCard = () => {
  // To remove once we get real event data, testing purpose only
  const event = {
    type: 'Exam',
    showType: true,
    online: false,
    inPerson: true,
    free: true,
    redirectWebsite: false,
    externalWebsiteLink: 'thisisatest.com',
    imageSrc:
      'https://s3-alpha-sig.figma.com/img/4b2f/6be8/496579955e4215283894d7be30dc4e12?Expires=1712534400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=B~RKKza7NCTHuU64kzvm4moVeArb1-GrVtpzzHEEMRyYCmbgJVNqjm1x~PS56G7e4MGcyltnvZ7-wPnh9-uXji~8fBQeZkHTU3MD3odRXKofdh2bFpIMhK~2Tbf-EF5QEABl4dcnuifIFpjPzx5ofTCBzThOfcHlsO0lGZTFhqOwlv~AsEYB-b8ATs~~rkOtQlrVL1Jdbozj~zGgU2ITU~jInrLV2D3vSjrXgHLeNJe6DKEg-JZIcR87brM4t~~QdxMbEFpxj7sak-wGQ-5gcvrfUlPAcCAwQMZ2TFkYf3LYnD-ZfLObh0V5h6uWBNWnw6uioj7jMVQDg~Tl904bBw__',
    title: 'Exam test',
    author: 'Author/organisator test',
    date: '16th March, 2024',
    hour: '4 to 7 pm (CET)',
    addressLine1: 'Address Line 1 Test',
    addressLine2: 'Address Line 2 Test',
    addressLine3: 'Address Line 3 Test',
    city: 'City test',
    country: 'Country test',
    languages: ['EN'],
    priceDollar: 500,
    priceSatoshis: 789267,
    maxAttendance: 40,
  };

  return (
    <article className="flex-1 min-w-[320px] max-w-[432px] max-[480px]:bg-[#1a1a1a] max-[480px]:p-2.5 max-[480px]:rounded-xl">
      {/* Image */}
      <div className="w-full aspect-[432/308] overflow-hidden rounded-2xl relative mb-4 max-[480px]:mb-2">
        <img
          src={event.imageSrc}
          alt={event.title}
          className="object-contain"
          width={432}
          height={308}
        />
        {event.showType && (
          <span className="absolute top-4 left-4 bg-white border border-[#b2b2b2] text-black text-sm font-medium leading-none py-1 px-2 rounded-sm">
            {event.type}
          </span>
        )}
        <div className="absolute top-4 right-4 bg-white border border-[#b2b2b2] py-1 px-1 flex flex-col justify-center items-center gap-1 rounded-sm">
          {event.languages.map((language: string) => (
            <Flag code={language} size="m" key={language} />
          ))}
        </div>
      </div>
      {/* Infos */}
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-2xl max-[480px]:text-lg">
          {event.title}
        </h3>
        <span className="font-medium max-[480px]:text-sm">{event.author}</span>
        <div className="text-sm flex flex-col gap-0.5 text-white/75 max-[480px]:text-xs">
          <div className="flex gap-1">
            <span>{event.date}</span>
            <span>·</span>
            <span>{event.hour}</span>
          </div>
          {event.inPerson && (
            <>
              <span>{event.addressLine1}</span>
              <span>{event.addressLine2}</span>
              <span>{event.addressLine3}</span>
              <span className="font-medium ">
                {event.city.toUpperCase()}, {event.country.toUpperCase()}
              </span>
            </>
          )}
          {event.online && !event.inPerson && (
            <span className="bg-[#cccccc] border border-[#999999] text-[#4d4d4d] text-sm font-medium leading-none py-1 px-2 rounded-sm w-fit max-[480px]:text-xs">
              online
            </span>
          )}
        </div>
      </div>
      {/* Price and buttons */}
      {!event.redirectWebsite && (
        <div className="flex flex-wrap gap-2 justify-between items-end mt-1 py-1">
          <div className="flex flex-col max-[480px]:text-sm">
            {!event.free && (
              <div className="flex gap-1 text-orange-600">
                <span className="font-semibold">${event.priceDollar}</span>
                <span>·</span>
                <span>{event.priceSatoshis.toLocaleString('en-US')} sats</span>
              </div>
            )}
            {event.free && (
              <span className="font-semibold text-orange-600">FREE</span>
            )}
            <span className="font-light text-xs italic leading-none">
              {event.maxAttendance > 0
                ? `limited to ${event.maxAttendance} people`
                : 'unlimited'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {event.online && (
              <Button
                variant="tertiary"
                size="s"
                className="rounded-lg max-[480px]:text-xs"
              >
                {event.free ? 'Watch live' : 'Book live'}
              </Button>
            )}
            {event.inPerson && (
              <Button
                variant="tertiary"
                size="s"
                className="rounded-lg max-[480px]:text-xs"
              >
                Book your seat
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Redirect website anchor */}
      {event.redirectWebsite && (
        <Anchor
          href={event.externalWebsiteLink}
          variant="tertiary"
          size="s"
          className="rounded-lg w-fit mx-auto mt-2 max-[480px]:text-xs"
        >
          Visit website
        </Anchor>
      )}
    </article>
  );
};
