"use client";
import { usePathname } from "next/navigation";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "./Footer";

export default function ClientLayout({ children, }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AuthDialog />
    </AuthProvider>
  );
}