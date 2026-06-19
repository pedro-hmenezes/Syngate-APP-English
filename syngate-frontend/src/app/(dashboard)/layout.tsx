'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    // bg-background → #fff no light, #0d1117 no dark (via variável CSS)
    <div className="flex h-screen overflow-hidden bg-background">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        <Header onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}