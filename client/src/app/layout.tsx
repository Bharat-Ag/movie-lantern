import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Lantern",
  description: "Movie Lantern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
