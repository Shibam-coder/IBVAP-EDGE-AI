'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SideNavBarProps {
  sectorId?: string;
  operatorId?: string;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  sectorId = 'SECTOR-07',
  operatorId = 'OPERATOR-42',
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Live Feed', icon: 'videocam', href: '/' },
    { label: 'Threat Intel', icon: 'warning', href: '/analytics' },
    { label: 'Asset Tracking', icon: 'location_searching', href: '/gis' },
    { label: 'System Health', icon: 'settings_input_component', href: '/health' },
    { label: 'Archives', icon: 'history', href: '/archives' },
  ];

  return (
    <aside className="bg-[#0f131a] text-[#a4e6ff] border-r border-[#3c494e] hidden md:flex flex-col justify-between py-4 w-60 shrink-0 z-40 select-none">
      <div>
        {/* Sector Header */}
        <div className="px-5 mb-6 pb-4 border-b border-[#3c494e]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1e2024] flex items-center justify-center border border-[#00d1ff]/30 text-[#00d1ff]">
              <span className="material-symbols-outlined text-lg">shield_person</span>
            </div>
            <div>
              <div className="font-sans text-base font-bold text-[#e2e2e8] tracking-tight">
                {sectorId}
              </div>
              <div className="font-mono text-[10px] text-[#859399] tracking-wider uppercase">
                {operatorId}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 font-mono text-xs">
          {navItems.map((item) => {
            const isActive =
              (item.href === '/' && pathname === '/') ||
              (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2.5 flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-[#00d1ff]/10 text-[#00d1ff] border-l-4 border-[#00d1ff] translate-x-0.5 font-bold'
                    : 'text-[#bbc9cf] hover:text-[#e2e2e8] hover:bg-[#1e2024]'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 flex flex-col gap-4">
        <button
          onClick={() => alert('Rapid Response Unit Dispatched to Sector 7')}
          className="w-full py-2 bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab] hover:text-[#690005] font-mono text-[11px] font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          DEPLOY RAPID RESPONSE
        </button>

        <div className="flex flex-col gap-1 font-mono text-[11px]">
          <button className="text-[#859399] hover:text-[#bbc9cf] py-1 flex items-center gap-2 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">analytics</span>
            Diagnostics
          </button>
          <button className="text-[#859399] hover:text-[#bbc9cf] py-1 flex items-center gap-2 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">help_outline</span>
            Help
          </button>
        </div>

        {/* User Card */}
        <div className="pt-3 border-t border-[#3c494e] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1e2024] flex items-center justify-center border border-[#3c494e] text-[#bbc9cf]">
            <span className="material-symbols-outlined text-base">person</span>
          </div>
          <div>
            <div className="font-mono text-[11px] text-[#e2e2e8]">{operatorId}</div>
            <div className="font-mono text-[9px] text-[#00d1ff] font-bold">AUTH LEVEL 4</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
