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
import { DashboardTabMobile } from '../components/dashboard-tab-mobile';
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
    className={`flex cursor-pointer flex-row items-center justify-center space-x-4 px-4 py-2 ${
      active ? 'bg-orange-400' : 'text-white'
    }`}
    onClick={onClick}
  >
    {icon}
    <div className="hidden font-bold sm:block">{text}</div>
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
      <MainLayout variant="blue" showFooter={false}>
        <div className="p-6">
          {currentTab === 'dashboard' && <DashboardTabMobile />}
          {/* {currentTab === 'courses' && <CoursesTab />} */}
          {currentTab === 'settings' && <SettingsTab />}
        </div>
        <div className="fixed bottom-0 z-[10] flex min-h-[68px] w-full items-center justify-around bg-orange-600 md:hidden">
          <MenuItem
            text="Dashboard"
            icon={<IoGridOutline size={28} />}
            active={currentTab === 'dashboard'}
            onClick={() => setCurrentTab('dashboard')}
          />
          <MenuItem
            text="Settings"
            icon={<IoSettingsOutline size={28} />}
            active={currentTab === 'settings'}
            onClick={() => setCurrentTab('settings')}
          />
          <MenuItem
            text="Sign Out"
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
        <div className=" flex w-64 flex-col gap-8 rounded-3xl p-4">
          <div className="flex items-center gap-2 rounded-3xl pl-2">
            <BsPersonFill className="text-blue-1000 h-10 w-10 overflow-hidden rounded-full bg-white" />
            <p className="text-lg font-medium italic">{user?.username}</p>
          </div>

          <div className="flex h-full flex-col items-start justify-between">
            <div className="flex flex-col items-start justify-center">
              <MenuItem
                text="Dashboard"
                icon={<IoGridOutline size={20} />}
                active={currentTab === 'dashboard'}
                onClick={() => setCurrentTab('dashboard')}
              />
              <MenuItem
                text="My Courses"
                icon={<AiOutlineBook />}
                active={currentTab === 'courses'}
                onClick={() => setCurrentTab('courses')}
              />
              <MenuItem
                text="Settings"
                icon={<IoSettingsOutline size={20} />}
                active={currentTab === 'settings'}
                onClick={() => setCurrentTab('settings')}
              />
            </div>
            <MenuItem
              text="Sign Out"
              icon={<IoLogOutOutline size={20} />}
              onClick={() => {
                dispatch(userSlice.actions.logout());
                navigate({ to: '/' });
              }}
            />
          </div>
        </div>

        <div className="ml-4 grow rounded-3xl bg-gray-200 p-10">
          {currentTab === 'dashboard' && <DashboardTab />}
          {/* {currentTab === 'courses' && <CoursesTab />} */}
          {currentTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </MainLayout>
  );
};
