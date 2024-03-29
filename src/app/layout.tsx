import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/client/components/ui/sonner";
import { CustomProvider } from "./custom-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <CustomProvider>{children}</CustomProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
