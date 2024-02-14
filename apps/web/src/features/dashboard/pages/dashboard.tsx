import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BsPersonFill } from 'react-icons/bs';
import {
  IoGridOutline,
  IoLogOutOutline,
  IoSettingsOutline,
} from 'react-icons/io5';

import { MainLayout } from '../../../components/MainLayout';
import { useAppDispatch } from '../../../hooks';
import { userSlice } from '../../../store';
import { trpc } from '../../../utils';
import { DashboardTab } from '../components/dashboard-tab';
import { SettingsTab } from '../components/settings-tab';

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

/*
    I will be using a basic navigation with a state and conditional rendering for now.
    I am currently rewriting the front app to better organize it and I will change this to a proper
    nested route during that refactor. It currently lives in another branch. Please forgive me.
  */

type Tabs = 'dashboard' | 'settings' | 'courses';

const MenuItem = ({
  text,
  icon,
  active,
  onClick,
}: {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => (
  <div
    className={`flex w-full cursor-pointer flex-row items-center justify-center gap-3 px-3 py-2 md:justify-start ${
      active && 'rounded-lg bg-orange-500'
    }`}
    onClick={onClick}
  >
    <div className="min-w-[20px]">{icon}</div>
    <div className="hidden sm:block">{text}</div>
  </div>
);

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<Tabs>('dashboard');
  const isMobile = useSmaller('md');

  const { data: user } = trpc.user.getDetails.useQuery();

  if (isMobile) {
    return (
      <MainLayout showFooter={false}>
        <div className="p-6 text-white">
          {currentTab === 'dashboard' && <DashboardTab />}
          {currentTab === 'settings' && <SettingsTab />}
        </div>
        <div className="fixed bottom-2 z-10 mx-auto flex w-full flex-row bg-orange-500 md:hidden md:bg-transparent">
          <MenuItem
            text="Dashboard"
            icon={<IoGridOutline size={28} />}
            active={currentTab === 'dashboard'}
            onClick={() => setCurrentTab('dashboard')}
          />
          <MenuItem
            text="My profile"
            icon={<IoSettingsOutline size={28} />}
            active={currentTab === 'settings'}
            onClick={() => setCurrentTab('settings')}
          />
          <MenuItem
            text="Log out"
            icon={<IoLogOutOutline size={28} />}
            onClick={() => {
              dispatch(userSlice.actions.logout());
              navigate({ to: '/' });
            }}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-row text-white">
        {/* Left menu */}
        <div className=" bg-dashboardsection ml-4 flex w-64 flex-col gap-8 rounded-xl p-4">
          <div className="flex items-center gap-2 rounded-3xl pl-2">
            <BsPersonFill className="text-blue-1000 h-10 w-10 overflow-hidden rounded-full bg-white" />
            <p className="text-lg font-medium italic">{user?.username}</p>
          </div>

          <div className="flex flex-col">
            <MenuItem
              text="Dashboard"
              icon={<IoGridOutline size={20} />}
              active={currentTab === 'dashboard'}
              onClick={() => setCurrentTab('dashboard')}
            />
            <MenuItem
              text="My courses"
              icon={<AiOutlineBook />}
              active={currentTab === 'courses'}
              onClick={() => setCurrentTab('courses')}
            />
            <MenuItem
              text="My profile"
              icon={<IoSettingsOutline size={20} />}
              active={currentTab === 'settings'}
              onClick={() => setCurrentTab('settings')}
            />
            <div className="mt-8">
              <MenuItem
                text="Log out"
                icon={<IoLogOutOutline size={20} />}
                onClick={() => {
                  dispatch(userSlice.actions.logout());
                  navigate({ to: '/' });
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-dashboardsection ml-4 grow rounded-xl p-10 text-white">
          {currentTab === 'dashboard' && <DashboardTab />}
          {currentTab === 'courses' && <DashboardTab />}
          {currentTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </MainLayout>
  );
};
