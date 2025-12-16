import "./globals.css";
import { AuthProvider } from "../components/AuthContext";
import LayoutWrapper from "../components/LayoutWrapper";
import { SocketProvider } from "@context/SocketContext"; // ✅ socket context যোগ করা হলো
import ClickSound from "../components/Sound"; // ✅ client-side sound component

// ✅ Metadata export is allowed only in server components
export const metadata = {
  title: "LetConnect",
  description: "Social platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white flex flex-col min-h-screen">
        <AuthProvider>
          <SocketProvider>
            <LayoutWrapper>
              {/* ✅ Client-side click sound */}
              <ClickSound />
              {/* ✅ Main content only */}
              <main className="flex-grow">{children}</main>
            </LayoutWrapper>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}