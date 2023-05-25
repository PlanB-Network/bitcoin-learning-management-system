import { Link } from 'react-router-dom';

import underConstructionImage from '../../assets/under-construction.png';
import { MainLayout } from '../../components';

export const UnderConstruction = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="flex flex-col items-center w-full p-10 space-y-16 h-full bg-gray-100 text-primary-700 font-primary">
        <section className="max-w-4xl ">
          <h1 className="mb-10 text-4xl font-bold lg:text-5xl">Oops.</h1>
          <p className="text-base font-bold lg:text-lg">
            A rabbit has tumbled down a hole. Because of this unexpected
            adventure, this page is under a bit of construction at the moment.
            We apologize for any inconvenience. Our team is in full gear to
            complete this page. If you're interested in lending a hand, please
            don't hesitate to check out our
            <Link
              className="mx-1 underline"
              to="https://github.com/blc-org/sovereign-academy"
            >
              GitHub
            </Link>
            and consider joining our community!
          </p>
        </section>
        <div>
          <img
            src={underConstructionImage}
            alt="Illustration of several rabbits working on a construction site"
            className="max-w-3xl w-[70vw] lg:w-[50vw]"
          />
        </div>
      </div>
    </MainLayout>
  );
};
