interface PersonProps {
  name: string;
  job: string;
  picture: string;
}

export const Person = ({ name, job, picture }: PersonProps) => {
  return (
    <div className="flex flex-row gap-6">
      <img
        src={picture}
        className="h-20 w-20 rounded-md"
        alt=""
        loading="lazy"
      />
      <div className="flex flex-col self-center">
        <p className="text-3xl font-semibold uppercase text-orange-500">
          {name}
        </p>
        <p>{job}</p>
      </div>
    </div>
  );
};
