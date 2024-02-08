import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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
      active ? 'text-blue-800' : 'text-white'
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
        <>
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
        </>
      </MainLayout>
    );
  }

  return (
    <MainLayout variant="dark" footerVariant="dark">
      <div className="bg-blue-1000 min-h-screen p-10">
        <div className="mx-auto grid min-h-[800px] max-w-4xl grid-cols-4 overflow-hidden rounded-3xl bg-gray-200 shadow xl:max-w-5xl">
          <div className="col-span-1 flex max-w-sm flex-col items-start justify-start space-y-8 bg-orange-500 p-4">
            <div className="w-full px-2">
              <div className="flex w-full items-center space-x-2 rounded-3xl bg-orange-400">
                <div className="p-1">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                    <BsPersonFill className="h-10 w-10" />
                  </div>
                </div>
                <div className="text-lg font-medium italic text-blue-900">
                  {user?.username}
                </div>
              </div>
            </div>
            <div className="flex h-full flex-col items-start justify-between">
              <div className="flex flex-col items-start justify-center">
                <MenuItem
                  text="Dashboard"
                  icon={<IoGridOutline size={20} />}
                  active={currentTab === 'dashboard'}
                  onClick={() => setCurrentTab('dashboard')}
                />
                {/* <MenuItem
                      text="My Courses"
                      icon={<AiOutlineBook />}
                      active={currentTab === 'courses'}
                      onClick={() => setCurrentTab('courses')}
                    /> */}
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
          <div className="col-span-3 p-10">
            {currentTab === 'dashboard' && <DashboardTab />}
            {/* {currentTab === 'courses' && <CoursesTab />} */}
            {currentTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
