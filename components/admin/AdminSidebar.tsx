"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Image as ImageIcon, Settings, FileText, Star, Link2, Menu, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-state";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/pages/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/pages/referrals", label: "Referrals", icon: Link2 },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
    setIsMounted(true);
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isOpen));
    }
  }, [isOpen, isMounted]);

  // Handle responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === null) {
        // Only auto-open on desktop if no preference is saved
        setIsOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      {/* Mobile menu button - only shows on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-black/80 text-white"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay - only shows when mobile menu is open */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 z-40 h-screen transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-64 lg:w-72' : 'md:w-20 -translate-x-full md:translate-x-0'}
          border-r border-white/10 bg-[#0d0d0d] flex-shrink-0
        `}
      >
        <div className="w-full h-full flex flex-col">
          <div className={`px-4 py-4 border-b border-white/10 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
            {isOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#CCFF00]" />
                <span className="text-white font-semibold tracking-wide">Aurora</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-[#CCFF00]" />
            )}
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`text-gray-400 hover:text-white p-1 transition-transform ${!isOpen ? 'rotate-180' : ''}`}
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition
                    ${active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                    ${!isOpen ? 'justify-center' : ''}
                    group
                  `}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
