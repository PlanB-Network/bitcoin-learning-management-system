interface OtherSimilarResourcesProps {
  resources: { title: string; id: string; image?: string }[];
  title?: string;
}

export const OtherSimilarResources = ({
  resources,
  title,
}: OtherSimilarResourcesProps) => {
  return (
    <div className="bg-primary-900 w-full pb-20 pt-12">
      <h4 className="mx-auto mb-8 w-max text-4xl text-white">
        {title ?? 'Other similar resources'}
      </h4>

      <div className="flex flex-row justify-center space-x-10">
        {resources.map(({ id, image, title }) =>
          image ? (
            <div
              key={id}
              className="group relative w-44 cursor-pointer rounded-md bg-gray-100"
            >
              <img
                className="w-full opacity-100 duration-200 group-hover:opacity-0"
                alt="resource preview"
                src={image}
              />
              <div className="group-hover:text-primary-800 absolute left-1/2 top-1/2 w-max max-w-full -translate-x-1/2 -translate-y-1/2 text-center text-transparent duration-300">
                {title}
              </div>
            </div>
          ) : (
            <div>{title}</div>
          )
        )}
      </div>
    </div>
  );
};
