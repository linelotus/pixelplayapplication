// --- src/components/Navbar.jsx ---
// Navigation bar for authenticated users.

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="main-navbar">
      <div className="nav-left">
        <Logo width="40" height="40" />
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
        <NavLink to="/story-generator" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Workouts</NavLink>
        <NavLink to="/avatar-editor" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>My Avatar</NavLink>
        <NavLink to="/habits" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Progress</NavLink>
      </div>
      <div className="nav-right">
        <div className="points-display">
          ⭐ {user?.points} Stars
        </div>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
};
