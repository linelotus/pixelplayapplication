import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./front/pages/Layout";
import Home from "./front/pages/Home";
import Demo from "./front/pages/Demo";
import Single from "./front/pages/Single";
import AvatarDemo from "./front/pages/AvatarDemo";


const BackendURL = () => (
    <div className="alert alert-danger" role="alert">
        This app is not connected to a backend! Make sure it is running.
    </div>
);

const App = () => {
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="/demo" element={<Demo />} />
                        <Route path="/single/:theid" element={<Single />} />
                        <Route path="/avatars" element={<AvatarDemo />} />
                        <Route path="*" element={<h1>Not found!</h1>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;