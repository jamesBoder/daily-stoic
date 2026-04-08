import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import BottomNav from "./BottomNav";
import { OfflineBanner } from "../common/OfflineBanner";

const scrollKey = (path: string) => `scroll_pos_${path}`;

export const Layout: React.FC = () => {
  const location = useLocation();
  const navType = useNavigationType();

  // Save scroll position for the current route as user scrolls (debounced via rAF)
  useEffect(() => {
    let rafId: number;
    const save = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        sessionStorage.setItem(scrollKey(location.pathname), String(window.scrollY));
      });
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.removeEventListener('scroll', save);
      cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  // On route change: restore saved position for back/forward, else scroll to top
  useEffect(() => {
    if (navType === 'POP') {
      const saved = sessionStorage.getItem(scrollKey(location.pathname));
      if (saved) {
        // Defer slightly so the new page has rendered before we jump
        requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, navType]);

  return (
    <div className="min-h-screen flex flex-col dark:text-[#e0ddd4]">
      <Header />
      <OfflineBanner />
      {/* pb-16 on mobile reserves space above the fixed BottomNav */}
      <main key={location.pathname} className="flex-1 pt-4 pb-20 md:pb-8 animate-fade-in">
        <Outlet />
      </main>
      <Footer className="hidden md:block" />
      <BottomNav />
    </div>
  );
};
