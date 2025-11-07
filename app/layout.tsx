"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDisplayPage = pathname === "/display";

  return (
    <>
      {!isDisplayPage && (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 glass backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    QRBB Admin
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Realtime entries
                  </div>
                </div>
              </div>
              <nav className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  v1.0 · modern
                </div>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className={isDisplayPage ? "h-screen" : "min-h-[calc(100vh-4rem)]"}>
        {children}
      </main>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>QRBB Admin | Realtime Entries</title>
        <meta
          name="description"
          content="Modern realtime form data management with live updates"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
