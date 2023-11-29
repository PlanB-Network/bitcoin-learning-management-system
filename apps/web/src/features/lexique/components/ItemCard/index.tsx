import { cn } from '@sovereign-university/ui';
import { IoChevronDownOutline } from 'react-icons/io5';

interface Props {
  expanded: number;
  setExpanded: (v: number) => void;
}

export const ItemCard = ({ expanded, setExpanded }: Props) => {
  const lexiquesDatas = [
    {
      id: 1,
      name: 'Addresses',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      id: 2,
      name: 'Addresses',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    },
  ];
  return (
    <div className="flex flex-col space-y-8 w-full">
      {lexiquesDatas.map((lexique) => (
        <div
          className={cn(
            'bg-white rounded-xl w-full transition-all duration-200',
            expanded === lexique.id && 'h-auto min-h-[200px] ',
          )}
          key={'lexique-' + lexique.id}
          style={{ transition: 'all 0.5s ease' }}
        >
          <div className="flex flex-col space-y-2 p-5 w-auto relative">
            <div className="flex flex-col w-min">
              <div className="items-end flex flex-row w-auto space-x-1 space-0">
                <span className="text-6xl font-semibold">
                  {lexique.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="">
                  {lexique.name.slice(1, lexique.name.length).toUpperCase()}
                </span>
                <span className="w-5" />
              </div>
              <span className="w-auto h-[1px] bg-gray-800" />
            </div>

            <span className="text-sm md:w-11/12 w-10/12">
              {expanded === lexique.id
                ? lexique.description
                : lexique.description.slice(0, 300) + '...'}
            </span>

            <button
              className={cn(
                'btn absolute rounded-full text-white bg-orange-600 right-5 md:top-10 top-14 w-12 h-12 flex items-center',
                expanded === lexique.id && 'hidden',
              )}
              onClick={() => setExpanded(lexique.id)}
            >
              <IoChevronDownOutline className="text-3xl mx-auto" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
