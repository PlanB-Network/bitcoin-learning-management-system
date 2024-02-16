import { useLocation } from '@react-hooks-library/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { BsPersonFill } from 'react-icons/bs';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

import { useAppDispatch } from '../../../hooks';
import { userSlice } from '../../../store';
import { trpc } from '../../../utils';

import { MenuItem } from './menu-item';

export const MenuDesktop = () => {
  const { data: user } = trpc.user.getDetails.useQuery();
  const [pathname, setPathname] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const location = useLocation();

  const dashboardPath = '/dashboard';
  const profilePath = '/dashboard/profile';
  const courseDetailPath = '/dashboard/course';

  useEffect(() => {
    if (location) {
      console.log(location);
      const { pathname } = location;
      if (pathname) {
        setPathname(pathname);
      }
    }
  }, [location]);

  return (
    <div className=" bg-dashboardsection ml-4 flex w-64 flex-col gap-8 rounded-xl p-4">
      <div className="flex items-center gap-2 rounded-3xl pl-2">
        <BsPersonFill className="text-blue-1000 size-10 overflow-hidden rounded-full bg-white" />
        <p className="text-lg font-medium italic">{user?.username}</p>
      </div>
      <div className="flex flex-col">
        {/* <Link to={dashboardPath}>
          <MenuItem
            text="Dashboard"
            icon={<IoGridOutline size={20} />}
            active={pathname === dashboardPath}
          />
        </Link> */}
        <Link to={dashboardPath}>
          <MenuItem
            text="My courses"
            icon={<AiOutlineBook />}
            active={
              pathname === dashboardPath ||
              pathname.startsWith(courseDetailPath)
            }
          />
        </Link>
        <Link to={profilePath}>
          <MenuItem
            text="My profile"
            icon={<IoSettingsOutline size={20} />}
            active={pathname === profilePath}
          />
        </Link>
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
  );
};
