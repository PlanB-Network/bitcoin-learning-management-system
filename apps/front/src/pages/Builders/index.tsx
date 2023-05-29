import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Card } from '../../atoms/Card';
import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

type Builder = {
    id: number,
    logo: string,
    name: string,
    language: string,
    category?: string,  // Category is optional
}

export const Builders = () => {
    // Fetching data from the API
    const { data: builders } = trpc.content.getBuilders.useQuery({
        language: 'en',
    });

    const categories = ['EXCHANGES', 'HARDWARE', 'GAMING'];

    // Adding a category to each builder
    const typedBuilders: Builder[] = builders ? builders.map((builder): Builder => ({
        ...builder,
        category: categories[Math.floor(Math.random() * categories.length)],
    })) : [];

    // Variables for styling
    const buildersCard = 'bg-primary-400 mx-8 rounded-3xl';
    const builderWrapper = 'grid grid-cols-4 m-2';
    const builderWrapperRow = 'p-2 my-1';
    const rowTitle = 'font-bold text-lg mb-2 py-2 px-4 rounded-md bg-orange-500 text-white w-full'; // Updated class
    // variables for enlarging the image on hover
    const enlargedImage = 'min-h-[120px] transform hover:bg-secondary-400 hover:scale-125 rounded-full w-20 m-auto transition duration-500 ease-in-out group';
    const enlargedName = 'text-white text-center opacity-0 group-hover:opacity-100 transition duration-300 font-light text-xs';

    return (
        <MainLayout>
            <div>
                <PageTitle>The Builders' Portal</PageTitle>
                <p className="text-justify mx-8 pb-3">This portal is open-source & open to contribution. Thanks for grading and sharing!</p>

                {categories.map(category => (
                    <Card key={category} className={buildersCard}>
                        <h3 className={rowTitle}>{category}</h3>
                        <div className={builderWrapper}>
                            {typedBuilders.filter(builder => builder.category === category).map((builder, index) => (
                                <div className={builderWrapperRow} key={index}>
                                    <Link
                                        to={replaceDynamicParam(Routes.Builder, {
                                            builderId: builder.id.toString(),
                                            language: builder.language,
                                        })}
                                    >
                                        <div className={enlargedImage}>
                                            <img className="rounded-full w-20 m-auto" src={builder.logo} alt={builder.name} />
                                            <p className={enlargedName}>{builder.name}</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}

                <Card className={buildersCard}>
                    <h3 className="text-2xl font-bold text-white mb-4">ALL</h3>
                    <div className={builderWrapper}>
                        {builders &&
                            builders.map((builder, index) => {
                                return (
                                    <div className={builderWrapperRow} key={index}>
                                        <Link
                                            to={replaceDynamicParam(Routes.Builder, {
                                                builderId: builder.id.toString(),
                                                language: builder.language,
                                            })}
                                        >
                                            <div className={enlargedImage}>
                                                <img className="rounded-full w-20 m-auto" src={builder.logo} alt={builder.name} />
                                                <p className={enlargedName}>{builder.name}</p>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

