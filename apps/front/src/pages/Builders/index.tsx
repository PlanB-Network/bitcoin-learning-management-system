import { useState } from 'react';
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
    const [searchTerm, setSearchTerm] = useState("");

    // Fetching data from the API
    const { data: builders } = trpc.content.getBuilders.useQuery({
        language: 'en',
    });
    console.log(builders)
    const categories = ['EXCHANGES', 'HARDWARE', 'GAMING'];

    // Adding a category to each builder
    const typedBuilders: Builder[] = builders ? builders.map((builder): Builder => ({
        ...builder,
        category: categories[Math.floor(Math.random() * categories.length)],
    })) : [];

    // Variables for styling
    const cards = 'bg-primary-400 mx-8 rounded-3xl';
    const search = 'bg-primary-100 mx-8 rounded-full';
    const builderWrapper = 'grid grid-cols-4 m-2';
    const builderWrapperRow = 'p-2 my-1';
    const rowTitle = 'font-bold text-lg mb-2 py-2 px-4 rounded-md bg-orange-500 text-white w-full'; // Updated class
    // variables for enlarging the image on hover
    const enlargedImage = 'min-h-[120px] transform hover:bg-secondary-400 hover:scale-125 rounded-full w-20 m-auto transition duration-500 ease-in-out group';
    const enlargedName = 'text-white text-center opacity-0 group-hover:opacity-100 transition duration-300 font-light text-xs';

    console.log(typedBuilders)

    return (
        <MainLayout>
            <div>
                <PageTitle>The Builders' Portal</PageTitle>
                <p className="text-justify mx-8 pb-3">This portal is open-source & open to contribution. Thanks for grading and sharing!</p>
                <Card className={cards && search}>
                    <p>Find the perfect resources for your needs:</p>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-1/3 rounded-full inline-block py-2 placeholder-gray-500 placeholder-opacity-50 border-0 focus:outline-none focus:ring focus:ring-gray-300 focus:border-gray-100 dark:bg-gray-700 focus:black dark:black dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
                    />
                </Card>
                {categories.map(category => (
                    <Card key={category} className={cards}>
                        <h3 className={rowTitle}>{category}</h3>
                        <div className={builderWrapper}>
                            {typedBuilders
                                .filter(builder => builder.category === category && builder.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((builder, index) => (
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
                <Card className={cards}>
                    <h3 className="text-2xl font-bold text-white mb-4">ALL</h3>
                    <div className={builderWrapper}>
                        {builders &&
                            builders
                                .filter(builder => builder.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((builder, index) => {
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

