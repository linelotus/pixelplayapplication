import React from 'react';
import { Outlet } from 'react-router-dom';
import { AvatarProvider } from '../Contexts/AvatarContext';

const RootLayout = () => {
  return (
    <AvatarProvider>
      <Outlet />
    </AvatarProvider>
  );
};

export default RootLayout;