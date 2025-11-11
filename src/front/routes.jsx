/**
 * 🗺️ App Routes Configuration
 * 
 * This file defines all the pages in your app and how to navigate between them!
 * Think of it like a map of your entire application.
 */

import React from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import ProtectedRoute from "./Contexts/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import GameHub from "./components/GameHub";
import AvatarEditor from "./components/AvatarEditor";
import HabitTracker from "./pages/HabitTracker";
import RewardStore from "./pages/RewardStore";
import StoryCreator from "./pages/StoryCreator";
import AuthCallback from './pages/AuthCallback';
import AvatarManager from "./components/AvatarManager";

// ===============================
// 🗺️ ROUTER CONFIGURATION
// ===============================
// This creates all the routes (pages) in your app

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // ===============================
      // 🏠 DEFAULT ROUTE
      // ===============================
      // When someone visits your app, send them to login
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },

      // ===============================
      // 🔓 PUBLIC ROUTES (No login required)
      // ===============================

      // Login page
      {
        path: "login",
        element: <Login />,
      },

      // OAuth callback - handles Google login redirect
      // ⚠️ CRITICAL: This must exist for Google login to work!
      {
        path: 'auth/callback',
        element: <AuthCallback />
      },

      // ===============================
      // 🔐 PROTECTED ROUTES (Login required)
      // ===============================

      // Home page (main landing after login)
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },

      // Dashboard
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },

      // Games section
      {
        path: "games",
        element: (
          <ProtectedRoute>
            <GameHub />
          </ProtectedRoute>
        ),
      },

      // Avatar editor
      {
        path: "avatar-editor",
        element: (
          <ProtectedRoute>
            <AvatarEditor />
          </ProtectedRoute>
        ),
      },

      // Avatar collection manager
      {
        path: "avatar-manager",
        element: (
          <ProtectedRoute>
            <AvatarManager />
          </ProtectedRoute>
        ),
      },

      // Alternative path for avatar collection
      {
        path: "collection",
        element: (
          <ProtectedRoute>
            <AvatarManager />
          </ProtectedRoute>
        ),
      },

      // Habit tracker
      {
        path: "habit-tracker",
        element: (
          <ProtectedRoute>
            <HabitTracker />
          </ProtectedRoute>
        ),
      },

      // Reward store
      {
        path: "reward-store",
        element: (
          <ProtectedRoute>
            <RewardStore />
          </ProtectedRoute>
        ),
      },

      // Story creator
      {
        path: "story-creator",
        element: (
          <ProtectedRoute>
            <StoryCreator />
          </ProtectedRoute>
        ),
      },

      // ===============================
      // 🔀 CATCH-ALL ROUTE
      // ===============================
      // Any unknown URL redirects to login
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);

// ===============================
// 📦 APP COMPONENT
// ===============================
// This wraps the router and provides it to your entire app

function App() {
  return <RouterProvider router={router} />;
}

// ✅ CRITICAL FIX: Export App, not router!
export default router;