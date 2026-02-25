import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AntdProvider from "@/components/AntdProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Mirror Management - Demo",
  description: "Smart Mirror Multi-Account RBAC Management System Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
