"use client";

import { usePathname } from 'next/navigation';
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';

  if (isAuthPage) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </>
  );
}
