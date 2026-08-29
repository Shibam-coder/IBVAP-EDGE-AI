'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopNavBarProps {
  currentTime?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTime = '14:22:09 IST',
}) => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'SURVEILLANCE', href: '/' },
    { name: 'RISK ANALYTICS', href: '/analytics' },
    { name: 'GIS MAP', href: '/gis' },
  ];

  return (
    <header className="bg-[#111318] text-[#a4e6ff] border-b border-[#3c494e] flex justify-between items-center w-full px-6 top-0 h-16 shrink-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-sans text-xl font-bold text-[#a4e6ff] tracking-tighter uppercase hover:text-[#00d1ff] transition-colors"
        >
          IBVAP-EDGE AI
        </Link>
        <nav className="hidden md:flex gap-6 items-center h-16">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-mono text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center h-full ${
                  isActive
                    ? 'text-[#a4e6ff] border-b-2 border-[#a4e6ff]'
                    : 'text-[#bbc9cf] hover:text-[#00d1ff]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Parameter */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#859399] text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Search parameters..."
            className="bg-[#05070a] border border-[#3c494e] rounded px-9 py-1 font-mono text-xs text-[#e2e2e8] placeholder:text-[#859399] focus:border-[#a4e6ff] focus:ring-1 focus:ring-[#a4e6ff] outline-none w-56 transition-all"
          />
        </div>

        {/* Time Stamp */}
        <div className="hidden lg:flex items-center gap-1 text-[#bbc9cf] font-mono text-xs border border-[#3c494e] px-2.5 py-1 bg-[#0c0e12]">
          <span className="material-symbols-outlined text-xs text-[#00d1ff]">schedule</span>
          <span>{currentTime}</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 text-[#bbc9cf]">
          <button
            title="Notifications"
            className="hover:text-[#00d1ff] p-1 scale-95 active:opacity-80 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
          </button>
          <button
            title="Settings"
            className="hover:text-[#00d1ff] p-1 scale-95 active:opacity-80 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
          <button
            title="User Profile"
            className="hover:text-[#00d1ff] p-1 scale-95 active:opacity-80 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
