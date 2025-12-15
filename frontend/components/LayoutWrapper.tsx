"use client";

import { usePathname } from "next/navigation";
import Header from "../components/Header";
import Image from "next/image";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideHeaderRoutes: string[] = ["/", "/login", "/signup"];
  const hideHeader = hideHeaderRoutes.includes(pathname);
  const showFloatingLogo = pathname !== "/"; // ✅ hide on landing page

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!hideHeader && <Header />}
      {children}
      {showFloatingLogo && (
        <Image
          src="/skt-logo.jpg"
          alt="SKT Logo"
          width={60}
          height={60}
          className="skt-floating-logo"
        />
      )}
    </div>
  );
}