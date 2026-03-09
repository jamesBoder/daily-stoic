import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { OfflineBanner } from "../common/OfflineBanner";


export const Layout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      <main key={location.pathname} className="flex-1 py-8 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
