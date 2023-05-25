import { useParams } from 'react-router-dom';

import builderImage from '../../assets/placeholder-assets/seedsigner.jpg';
import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { RelatedResources } from '../../components/RelatedResources';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Builder = () => {
  const { builderId } = useParams();
  return (
    <MainLayout>
      <PageTitle>{builderId}</PageTitle>
      <div className="flex flex-row justify-evenly items-start m-10">
        <img
          className="mx-12 my-4 w-64 h-auto"
          src={builderImage}
          alt="something representing the company"
        />
        <div className="flex flex-col mr-12 space-y-4 text-sm">
          <p className="max-w-xl text-justify">
            SeedSigner est un projet visant à réduire le coût et la complexité
            de l'utilisation des portefeuilles multi-signature Bitcoin. Il
            permet de créer un dispositif de signature Bitcoin hors ligne,
            vérifiable et sans état en utilisant des composants matériels peu
            coûteux (généralement ~50$). SeedSigner facilite la génération de
            clés privées sans confiance, la configuration de portefeuilles
            multi-signatures et la réalisation de transactions Bitcoin via un
            modèle de signature d'échange QR sécurisé et isolé.
          </p>

          <p className="max-w-xl text-justify">
            Les principales fonctionnalités de SeedSigner comprennent :
            <ul className="pl-4 list-disc">
              <li>
                Génération et stockage temporaire de phrases de départ BIP39
              </li>
              <li>
                Création de SeedQR pour une saisie rapide Prise en charge de la
              </li>
              <li>
                phrase de passe BIP39 / mot 25 Génération native Segwit Multisig
              </li>
              <li>
                XPUB avec affichage QR Numérisation et analyse des données de
              </li>
              <li>
                transaction à partir de codes QR animés Prise en charge de
                Bitcoin
              </li>
              <li>
                Mainnet & Testnet Vérification de l'adresse de réception à la
              </li>
              <li>demande Interface utilisateur réactive et événementielle</li>
            </ul>
          </p>

          <p className="max-w-xl text-justify">
            SeedSigner utilise une version spécifique du Raspberry Pi Zero
            (version 1.3) sans WiFi ni Bluetooth, garantissant la sécurité des
            clés privées. La communication avec le logiciel de portefeuille se
            fait via un échange de codes QR bidirectionnel. SeedSigner est
            compatible avec Spectre-Desktop, Sparrow Wallet et BlueWallet
            Multisig Vaults.
          </p>

          <RelatedResources
            tutoriel={[{ label: 'Seed signer Device' }]}
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
    </MainLayout>
  );
};
