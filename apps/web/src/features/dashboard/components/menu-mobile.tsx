import { useLocation } from '@react-hooks-library/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

import { useAppDispatch } from '../../../hooks';
import { userSlice } from '../../../store';

import { MenuItem } from './menu-item';

export const MenuMobile = () => {
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
    <div className="fixed bottom-2 z-10 mx-auto flex w-full flex-row bg-orange-500 md:hidden md:bg-transparent">
      <Link to={dashboardPath} className="w-full">
        <MenuItem
          text="My courses"
          icon={<AiOutlineBook size={28} />}
          active={
            pathname === dashboardPath || pathname.startsWith(courseDetailPath)
          }
        />
      </Link>
      <Link to={profilePath} className="w-full">
        <MenuItem
          text="My profile"
          icon={<IoSettingsOutline size={28} />}
          active={pathname === profilePath}
        />
      </Link>
      <MenuItem
        text="Log out"
        icon={<IoLogOutOutline size={28} />}
        onClick={() => {
          dispatch(userSlice.actions.logout());
          navigate({ to: '/' });
        }}
      />
    </div>
  );
};
