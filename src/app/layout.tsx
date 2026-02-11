import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AntdProvider from "@/components/AntdProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "试衣镜管理系统 - Demo",
  description: "智能试衣镜多账号权限管理系统演示",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} antialiased`}>
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
