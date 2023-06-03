import { Link } from 'react-router-dom';

import { ReactComponent as LostRabbit } from '../../assets/404.svg';
import { MainLayout } from '../../components/MainLayout';

export const NotFound = () => {
  return (
    <MainLayout footerVariant="dark">
      <div className="bg-primary-900 text-primary-700 font-primary flex h-full w-full flex-col items-center space-y-16 p-10">
        <section className="max-w-4xl text-white">
          <h1 className="mb-10 text-4xl font-bold lg:text-5xl">Oops.</h1>
          <p className="text-base font-bold lg:text-lg">
            Seems like someone fell too deep into the rabbit hole and got lost.
            To come back to the surface, click
            <Link className="ml-2 underline" to="/">
              here
            </Link>
            .
          </p>
        </section>
        <LostRabbit className="w-[70vw] max-w-3xl lg:w-[50vw]" />
      </div>
    </MainLayout>
  );
};
