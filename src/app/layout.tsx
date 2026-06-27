import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mnemosyne AI — A Digital Memory Layer for Humanity",
  description:
    "Preserve a person's knowledge, reasoning and experience beyond their lifespan. Upload their writings, let AI weave a knowledge graph, and converse with the intelligence they left behind.",
  keywords: ["Mnemosyne", "digital memory", "AI", "knowledge graph", "RAG", "legacy", "intelligence"],
  authors: [{ name: "Mnemosyne AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Mnemosyne AI — A Digital Memory Layer for Humanity",
    description: "Books preserved what humans knew. Mnemosyne preserves how humans thought.",
    siteName: "Mnemosyne AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col pb-14 md:pb-0`}
      >
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
            <Sonner />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
