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

    const categories = ['EXCHANGES', 'HARDWARE', 'GAMING'];

    // Adding a category to each builder
    const typedBuilders: Builder[] = builders ? builders.map((builder): Builder => ({
        ...builder,
        category: categories[Math.floor(Math.random() * categories.length)],
    })) : [];

    // Variables for styling
    const mainContent = 'bg-primary-900 relative block p-[3em]';
    const cards = 'bg-primary-100 m-8 rounded-3xl';
    const search = 'bg-primary-100 mx-8 px-4 rounded-full';
    const builderWrapper = 'grid grid-cols-6 m-2';
    const builderWrapperRow = 'p-2 my-1';
    const rowTitle = 'font-bold text-lg mb-2 py-2 px-4 rounded-md bg-orange-500 text:bg-primary-100 w-full';

    // variables for enlarging the image on hover
    const enlargedImage = 'min-w-[100px] min-h-[130px] transform p-2 hover:bg-secondary-400 hover:scale-125 rounded-full w-20 m-auto transition duration-500 ease-in-out group';
    const enlargedName = 'text-white text-center opacity-0 group-hover:opacity-100 transition duration-300 font-light text-xs';

    return (
        <MainLayout>
            <div className={mainContent}>
                <PageTitle>The Builders' Portal</PageTitle>
                <p className="text-justify mx-8 pb-3 text-white">This portal is open-source & open to contribution. Thanks for grading and sharing!</p>
                <Card className={cards && search}>
                    <div className={'grid grid-cols-2' }>
                        <div className="cols-1">
                        <p className={'py-2'}>Find the perfect resources for your needs:</p>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-2/3 rounded-full inline-block py-2 placeholder-gray-500 placeholder-opacity-50 border-0 focus:outline-none focus:ring focus:ring-gray-300 focus:border-gray-100 dark:bg-gray-700 focus:black dark:black dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
                        />
                        </div>
                        <div className="col-1 flex justify-end items-center">
                            <button className="text-justify underline">Additional criteria</button>
                        </div>
                    </div>
                </Card>
                {categories.map(category => {
                    const filteredBuilders = typedBuilders.filter(builder => builder.category === category && builder.name.toLowerCase().includes(searchTerm.toLowerCase()));

                    // If no result, do not show an empty card.
                    if(filteredBuilders.length === 0) {
                        return null;
                    }

                    return (
                        <Card key={category} className={cards}>
                            <h3 className={rowTitle}>{category}</h3>
                            <div className={builderWrapper}>
                                {filteredBuilders.map((builder, index) => (
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
                    );
                })}
            </div>
        </MainLayout>
    );
};

