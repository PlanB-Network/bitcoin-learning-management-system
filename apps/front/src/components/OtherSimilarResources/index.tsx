interface OtherSimilarResourcesProps {
  resources: { title: string; id: string; image?: string }[];
  title?: string;
}

export const OtherSimilarResources = ({
  resources,
  title,
}: OtherSimilarResourcesProps) => {
  return (
    <div className="pt-12 pb-20 w-full bg-primary-900">
      <h4 className="mx-auto mb-8 w-max text-4xl text-white">
        {title ?? 'Other similar resources'}
      </h4>

      <div className="flex flex-row justify-center space-x-10">
        {resources.map(({ id, image, title }) =>
          image ? (
            <div
              key={id}
              className="relative w-44 bg-gray-100 rounded-md cursor-pointer group"
            >
              <img
                className="w-full opacity-100 duration-200 group-hover:opacity-0"
                alt="resource preview"
                src={image}
              />
              <div className="absolute top-1/2 left-1/2 w-max max-w-full text-center text-transparent duration-300 -translate-x-1/2 -translate-y-1/2 group-hover:text-primary-800">
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
