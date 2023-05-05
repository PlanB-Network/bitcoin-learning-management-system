import { Button } from '../../atoms/Button';
import { Tag } from '../../atoms/Tag';
import { MainLayout } from '../../components';
import { OtherSimilarRessources } from '../../components/OtherSimilarRessources';
import { RelatedRessources } from '../../components/RelatedRessources';
import { RessourceReview } from '../../components/RessourceReview';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

import { BookSummary } from './BookSummary';

export const Book = () => {
  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between mx-auto my-24 w-screen max-w-4xl">
          <div className="flex flex-col justify-between py-4 mr-12 w-max">
            <img
              className="w-72"
              alt="book cover"
              src="https://s3-alpha-sig.figma.com/img/de3f/833b/7b36453f9b870323ca302166ac36f950?Expires=1684108800&Signature=YmDnqe6IS5uzZrIv4s9jSDSijM-25fglueBNQCTdHGi6a8iPu2KiuemfgQJaSP77BCkL0PwB3QRYV0hpfYyEKgigi5WB0N3A8wfh~LsPViqBHnpB87DLCslP41xVKmmkUsViu99vQmdU4kMp1N25D5awcQEOlOmeDAzWs4~1eW6h7ZXdMvXXA9gLKWVyMLaM14EbxXTG8z8E7imGzapFLEMewVN361F925gz3t3Vds0jJRpfUUHo680Kxc-wPzPWfr5hahzVSPcSyTOB7Mm4l4F9wmojLOHtEoGHX5-olpLkCRExy-Jkm9omtQ3BYEKPZFNOH6rhNQW6JnCZ-f8pUQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
            />

            <div className="flex flex-row justify-evenly mt-4 w-full">
              <Button size="s">PDF / E-Book</Button>
              <Button size="s">Buy physical</Button>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h2 className="mb-3 text-2xl font-semibold text-primary-800">
                The sovereign Individual
              </h2>

              <div className="text-xs">
                <h5>Autheur: James Dale Davidson & Lord William Rees-Mogg</h5>
                <h5>Date: 1997</h5>
              </div>
            </div>

            <div>
              <Tag>Bitcoin</Tag>
              <Tag>Technology</Tag>
              <Tag>Philosophy</Tag>
            </div>

            <div>
              <h3 className="mb-4 text-lg">Abstract</h3>
              <p className="max-w-lg text-xs text-justify text-ellipsis line-clamp-[9]">
                "The Sovereign Individual" is a non-fiction book that delves
                into the concept of individual sovereignty and its potential
                emergence in the digital age, particularly in the context of
                internet and other technological advancements. The book explores
                the implications of decentralized networks, cryptography, and
                digital currencies on society and individual freedom, arguing
                that they will lead to a significant transformation of
                governance, economics, and culture. It also discusses the
                potential rise of a new kind of elite, the sovereign individual,
                who would be empowered by these technological developments and
                able to circumvent traditional power structures. The book is a
                thought-provoking and challenging read for those interested in
                the potential impact of Bitcoin and the digital age on our
                society and way of life.
              </p>
            </div>

            <RelatedRessources
              audioBook={[{ label: 'Need to be recorded!' }]}
              interview={[
                {
                  label: 'CEO Interview',
                  path: replaceDynamicParam(Routes.Interview, {
                    interviewId: 'ja78172',
                  }),
                },
              ]}
              course={[
                {
                  label: 'BTC 204',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'btc-204',
                  }),
                },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-row justify-center pb-48">
          <BookSummary
            contributor={{
              username: 'Asi0',
              title: 'Bitcoiner',
              image:
                'https://s3-alpha-sig.figma.com/img/f78f/1e1b/31b02829439b7d99accf532e11433adb?Expires=1684108800&Signature=XX34dFwoAxGVmh2oqiWSHvy0Ib4cv63pHM3I-ZTobT~DupI42GWVAUjhGpeC5~hRPa~cT-QHeLmk1-plXSvuu55v29uy7bv80l6xo4OLKc4HgFKSoRh9-fOiA~SE5Hb8bcq4flhELEQhfLhKmeF8fykdrNmEtsYB0VlR~C8iIB80ghRWIGzko4lE0VqOeOg9nXh8PMBtLC7DEwtE2XlqtohPOD-htwnMjkmjUn~wKYPfw04N7o8nwDM7KzjsEKxCyb~qpPr899vKVy6Mame9wBoUX83ESzgE~xCgLduQI~4t77UTDXjxG5Qkdsvm4no7ec0oamB0fHKaTwPoViiZbA__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
            }}
            title="A journey into sovreignty"
            content="If it's not the Presentation mode that's causing the issue, it's possible that you accidentally triggered a different mode or setting in Figma that is causing the screen to display in black and white with a purple overlay. One thing you could try is to reset your Figma preferences. To do this, click on your user icon in the bottom left-hand corner of the Figma interface, and then select 'Help & Account' from the dropdown menu. From there, select 'Troubleshooting' and then click the 'Reset Figma' button. This should reset your preferences and return Figma to its default settings. If resetting your preferences doesn't work, it's possible that there is another issue causing the problem. You might try clearing your browser's cache and cookies, or trying to access Figma using a different browser or device to see if the issue persists. If none of these solutions work, you may want to contact Figma's support team for further assistance."
          />

          <div className="py-4 max-w-lg">
            <RessourceReview />
          </div>
        </div>

        <OtherSimilarRessources
          title="Proposition de lecture"
          ressources={[
            {
              title: 'Discours de la servitude volontaire',
              id: 'discours-de-la-servitude-volontaire',
              image:
                'https://s3-alpha-sig.figma.com/img/de3f/833b/7b36453f9b870323ca302166ac36f950?Expires=1684108800&Signature=YmDnqe6IS5uzZrIv4s9jSDSijM-25fglueBNQCTdHGi6a8iPu2KiuemfgQJaSP77BCkL0PwB3QRYV0hpfYyEKgigi5WB0N3A8wfh~LsPViqBHnpB87DLCslP41xVKmmkUsViu99vQmdU4kMp1N25D5awcQEOlOmeDAzWs4~1eW6h7ZXdMvXXA9gLKWVyMLaM14EbxXTG8z8E7imGzapFLEMewVN361F925gz3t3Vds0jJRpfUUHo680Kxc-wPzPWfr5hahzVSPcSyTOB7Mm4l4F9wmojLOHtEoGHX5-olpLkCRExy-Jkm9omtQ3BYEKPZFNOH6rhNQW6JnCZ-f8pUQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
            },
            {
              title: 'Check your financiel priviledge',
              id: 'check-your-financiel-priviledge',
              image:
                'https://s3-alpha-sig.figma.com/img/de3f/833b/7b36453f9b870323ca302166ac36f950?Expires=1684108800&Signature=YmDnqe6IS5uzZrIv4s9jSDSijM-25fglueBNQCTdHGi6a8iPu2KiuemfgQJaSP77BCkL0PwB3QRYV0hpfYyEKgigi5WB0N3A8wfh~LsPViqBHnpB87DLCslP41xVKmmkUsViu99vQmdU4kMp1N25D5awcQEOlOmeDAzWs4~1eW6h7ZXdMvXXA9gLKWVyMLaM14EbxXTG8z8E7imGzapFLEMewVN361F925gz3t3Vds0jJRpfUUHo680Kxc-wPzPWfr5hahzVSPcSyTOB7Mm4l4F9wmojLOHtEoGHX5-olpLkCRExy-Jkm9omtQ3BYEKPZFNOH6rhNQW6JnCZ-f8pUQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
            },
            {
              title: "L'ordre mondial en mutation",
              id: 'l-ordre-mondial-en-mutation',
              image:
                'https://s3-alpha-sig.figma.com/img/de3f/833b/7b36453f9b870323ca302166ac36f950?Expires=1684108800&Signature=YmDnqe6IS5uzZrIv4s9jSDSijM-25fglueBNQCTdHGi6a8iPu2KiuemfgQJaSP77BCkL0PwB3QRYV0hpfYyEKgigi5WB0N3A8wfh~LsPViqBHnpB87DLCslP41xVKmmkUsViu99vQmdU4kMp1N25D5awcQEOlOmeDAzWs4~1eW6h7ZXdMvXXA9gLKWVyMLaM14EbxXTG8z8E7imGzapFLEMewVN361F925gz3t3Vds0jJRpfUUHo680Kxc-wPzPWfr5hahzVSPcSyTOB7Mm4l4F9wmojLOHtEoGHX5-olpLkCRExy-Jkm9omtQ3BYEKPZFNOH6rhNQW6JnCZ-f8pUQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
            },
            {
              title: 'Le prix de demain',
              image:
                'https://s3-alpha-sig.figma.com/img/de3f/833b/7b36453f9b870323ca302166ac36f950?Expires=1684108800&Signature=YmDnqe6IS5uzZrIv4s9jSDSijM-25fglueBNQCTdHGi6a8iPu2KiuemfgQJaSP77BCkL0PwB3QRYV0hpfYyEKgigi5WB0N3A8wfh~LsPViqBHnpB87DLCslP41xVKmmkUsViu99vQmdU4kMp1N25D5awcQEOlOmeDAzWs4~1eW6h7ZXdMvXXA9gLKWVyMLaM14EbxXTG8z8E7imGzapFLEMewVN361F925gz3t3Vds0jJRpfUUHo680Kxc-wPzPWfr5hahzVSPcSyTOB7Mm4l4F9wmojLOHtEoGHX5-olpLkCRExy-Jkm9omtQ3BYEKPZFNOH6rhNQW6JnCZ-f8pUQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
              id: 'le-prix-de-demain',
            },
          ]}
        />
      </div>
    </MainLayout>
  );
};
