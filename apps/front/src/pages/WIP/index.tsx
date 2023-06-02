import rabbitWip from '../../assets/rabbit-wip.png';
import { MainLayout } from '../../components/MainLayout';

export const WIP = () => {
  return (
    <MainLayout>
      <div className="bg-primary-900 h-screen w-screen pt-32">
        <img className="mx-auto h-1/2 w-auto" src={rabbitWip} />
        <h1 className="mx-auto mt-12 w-max text-3xl font-thin text-white">
          Work In Progress here!
        </h1>
      </div>
    </MainLayout>
  );
};
