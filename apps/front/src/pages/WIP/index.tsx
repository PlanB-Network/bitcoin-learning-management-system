import rabbitWip from '../../assets/rabbit-wip.png';
import { MainLayout } from '../../components/MainLayout';

export const WIP = () => {
  return (
    <MainLayout>
      <div className="pt-32 w-screen h-screen bg-primary-900">
        <img className="mx-auto w-auto h-1/2" src={rabbitWip} />
        <h1 className="mx-auto mt-12 w-max text-3xl font-thin text-white">Work In Progress here!</h1>
      </div>
    </MainLayout>
  );
};
