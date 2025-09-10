import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { AvatarDashboard } from "./pages/AvatarDashboard";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* AvatarDashboard is the only page */}
        <Route path="/" element={<AvatarDashboard />} />
        
        {/* Catch all other routes and redirect to dashboard */}
        <Route path="*" element={<AvatarDashboard />} />
      </>
    )
);