// This is the root component that defines all the application routes.

// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import HomePage from './pages/HomePage';
// import Dashboard from './pages/Dashboard';
// import StoryGenerator from './pages/StoryGenerator';
// import AvatarEditor from './pages/AvatarEditor';
// import HabitTracker from './pages/HabitTracker';
// import GamesHub from './pages/GamesHub';
// import RewardStore from './pages/RewardStore';
// import NotFound from './pages/NotFound';
// import Navbar from './components/Navbar';

// export default function App() {
//     const { isAuthenticated } = useAuth();

//     return (
//         <>
//             {isAuthenticated && <Navbar />}
//             <main>
//                 <Routes>
//                     <Route path="/" element={<HomePage />} />
//                     {/* Protected Routes */}
//                     <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <HomePage />} />
//                     <Route path="/story-generator" element={isAuthenticated ? <StoryGenerator /> : <HomePage />} />
//                     <Route path="/avatar-editor" element={isAuthenticated ? <AvatarEditor /> : <HomePage />} />
//                     <Route path="/habits" element={isAuthenticated ? <HabitTracker /> : <HomePage />} />
//                     <Route path="/games" element={isAuthenticated ? <GamesHub /> : <HomePage />} />
//                     <Route path="/rewards" element={isAuthenticated ? <RewardStore /> : <HomePage />} />
//                     <Route path="*" element={<NotFound />} />
//                 </Routes>
//             </main>
//         </>
//     );
// };

// ReactDOM.createRoot(document.getElementById('root')).render(<App />);
