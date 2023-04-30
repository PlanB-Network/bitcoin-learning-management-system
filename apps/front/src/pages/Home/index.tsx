import dbHomeImg1 from '../../assets/db-home-img-1.png';
import { Button } from '../../atoms/Button';
import { MainLayout } from '../../components';

import { CoursePreview } from './CoursePreview';

const course1 = {
  author: {
    name: 'Rogzy',
    img: 'https://academie.decouvrebitcoin.fr/wp-content/uploads/2022/04/rogzy-1-1-80x80.png',
  },
  title: 'BTC 101 - Le parcours Bitcoin',
  subTitle: '100',
  tags: ['Théorique', '6 chapitres', '14 leçons', 'Débutant'],
  preview: {
    img: 'https://academie.decouvrebitcoin.fr/wp-content/uploads/2022/04/BTC-101_vignette-presentation-02-1024x538.png',
    text: 'Rentre dans le terrier du Bitcoin et découvre tous les aspects de notre écosystème ! Origine, portefeuille, mineurs, Lightning Network... Deviens un vrai petit expert !',
  },
};

const course2 = {
  author: {
    name: 'Rogzy',
    img: 'https://academie.decouvrebitcoin.fr/wp-content/uploads/2022/04/rogzy-1-1-80x80.png',
  },
  title: 'BTC 102 - Obtenir ses premiers bitcoins',
  subTitle: '100',
  tags: ['Pratique', '5 chapitres', '15 leçons', 'Débutant'],
  preview: {
    img: 'https://academie.decouvrebitcoin.fr/wp-content/uploads/2022/10/BTC102-Vignette-presentation-1024x538.png',
    text: "Mets en place ton plan Bitcoin et deviens bitcoiner. Nous t'aidons à créer ta sécurité et obtenir tes premiers bitcoins.",
  },
};

export const Home = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="flex flex-row justify-evenly items-center w-full h-full bg-gray-100 text-primary-700 font-primary">
        <div className="max-w-lg w-[50vw]">
          <section>
            <h1 className="mb-10 text-4xl font-primary lg:text-5xl">
              Développe ton
              <br />
              expertise Bitcoin
            </h1>
            <p className="max-w-full text-base font-thin text-gray-600 lg:text-lg">
              Suis les cours d’expert Bitcoin et décroche ton diplôme Bitcoin.
              Tous les cours sont 100% gratuits et pensés pour tous les niveaux.
            </p>
            <p className="max-w-full text-base font-thin text-gray-600 lg:text-lg">
              De débutant à expert.
            </p>

            <div className="flex flex-col mt-12">
              <Button className="justify-center mt-3" type="button">
                BTC 101 - Pour débuter en toute sécurité!
              </Button>
              <Button
                className="justify-center mt-3"
                variant="secondary"
                type="button"
                outlined
              >
                Notre dernière formation : BTC 205
              </Button>
            </div>
          </section>
        </div>
        <div>
          <img
            src={dbHomeImg1}
            alt="Decouvre bitcoin home hero"
            className="max-w-sm w-[25vw]"
          />
        </div>
      </div>

      {/* Formations */}
      <div className="bg-white">
        <h2 className="mx-auto my-8 w-max text-3xl font-primary text-primary-700">
          8 formations pour se lancer dans Bitcoin !
        </h2>

        <div className="flex flex-row justify-center items-center py-8">
          <CoursePreview {...course1} />
          <CoursePreview {...course2} />
        </div>
      </div>
    </MainLayout>
  );
};
