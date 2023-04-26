import { useScroll } from '@react-hooks-library/core';
import { Button } from 'primereact/button';
import { useRef, useState } from 'react';

import dbHomeImg1 from '../../assets/db-home-img-1.png';
import { Header } from '../../components';

import { CoursePreview } from './CoursePreview';
import {
  courseContainer,
  courseTitle,
  coursesSection,
  heroSection,
  heroSectionCtaButton,
  heroSectionCtaContainer,
  image,
  imageSection,
  textParagraph,
  textTitle,
  textualSection,
} from './index.css';

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
  const box = useRef<HTMLDivElement | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useScroll(box, ({ scrollX, scrollY }) => {
    setHasScrolled(scrollY > 0);
  });

  return (
    <div ref={box} style={{ height: '100vh', overflow: 'auto' }}>
      {/* Header */}
      <Header isExpanded={!hasScrolled} />

      {/* Hero Section */}
      <div className={heroSection}>
        <div className={textualSection}>
          <section>
            <h1 className={textTitle}>
              Développe ton
              <br />
              expertise Bitcoin
            </h1>
            <p className={textParagraph}>
              Suis les cours d’expert Bitcoin et décroche ton diplôme Bitcoin.
              Tous les cours sont 100% gratuits et pensés pour tous les niveaux.
            </p>
            <p className={textParagraph}>De débutant à expert.</p>

            <div className={heroSectionCtaContainer}>
              <Button
                className={heroSectionCtaButton}
                label="BTC 101 - Pour débuter en toute sécurité!"
                type="button"
              ></Button>
              <Button
                className={heroSectionCtaButton}
                label="Notre dernière formation : BTC 205"
                type="button"
                outlined
              ></Button>
            </div>
          </section>
        </div>
        <div className={imageSection}>
          <img
            src={dbHomeImg1}
            alt="Decouvre bitcoin home hero"
            className={image}
            style={{ clipPath: 'polygon(8% 0, 100% 0%, 100% 100%, 0 100%)' }}
          />
        </div>
      </div>

      {/* Formations */}
      <div className={coursesSection}>
        <h2 className={courseTitle}>
          8 formations pour se lancer dans Bitcoin !
        </h2>

        <div className={courseContainer}>
          <CoursePreview {...course1} />
          <CoursePreview {...course2} />
        </div>
      </div>
    </div>
  );
};
