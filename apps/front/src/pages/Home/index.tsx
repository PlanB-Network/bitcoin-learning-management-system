import dbHomeImg1 from '../../assets/db-home-img-1.png';
import { Button } from '../../atoms/Button';
import { MainLayout } from '../../components';
import { CoursePreview } from '../../components/CoursePreview';

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
      <div className="text-primary-700 font-primary flex h-full w-full flex-row items-center justify-evenly bg-gray-100">
        <div className="w-[50vw] max-w-lg">
          <section>
            <h1 className="font-primary mb-10 text-4xl lg:text-5xl">
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

            <div className="mt-12 flex flex-col">
              <Button className="mt-3" type="button">
                BTC 101 - Pour débuter en toute sécurité!
              </Button>
              <Button className="mt-3" variant="secondary" type="button">
                Notre dernière formation : BTC 205
              </Button>
            </div>
          </section>
        </div>
        <div>
          <img
            src={dbHomeImg1}
            alt="Decouvre bitcoin home hero"
            className="w-[25vw] max-w-sm"
          />
        </div>
      </div>

      {/* Formations */}
      <div className="bg-white">
        <h2 className="font-primary text-primary-700 mx-auto my-8 w-max text-3xl">
          8 formations pour se lancer dans Bitcoin !
        </h2>

        <div className="flex flex-row items-center justify-center py-8">
          <CoursePreview {...course1} />
          <CoursePreview {...course2} />
        </div>
      </div>
    </MainLayout>
  );
};
