import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import BottomNav from "./BottomNav";
import { OfflineBanner } from "../common/OfflineBanner";


export const Layout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      {/* pb-16 on mobile reserves space above the fixed BottomNav */}
      <main key={location.pathname} className="flex-1 py-8 pb-20 md:pb-8 animate-fade-in">
        <Outlet />
      </main>
      <Footer className="hidden md:block" />
      <BottomNav />
    </div>
  );
};
