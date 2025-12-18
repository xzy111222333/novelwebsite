import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "轻写 — 纯粹而优雅的小说创作空间",
  description:
    "轻写提供免费的在线小说创作体验，集成写作工作台、角色/世界观工作室与 AI 辅助，随时开启灵感之旅。",
  keywords: [
    "小说创作",
    "写作工作台",
    "AI 写作助手",
    "在线写作",
    "角色设定",
    "世界观构建",
  ],
  authors: [{ name: "轻写" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logo-64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: '/icon-192.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "轻写",
    description: "小而美的小说创作空间，永久免费且无需登录。",
    url: "https://qingxie.app",
    siteName: "轻写",
    type: "website",
    images: ['/icon-512.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "轻写",
    description: "纯粹而优雅的小说创作体验，随时随地开始写作。",
    images: ['/icon-512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
