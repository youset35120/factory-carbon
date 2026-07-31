// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/lib/i18n'; // <--- ต้องมีบรรทัดนี้นะครับ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carbon Footprint Calculator",
  description: "Factory Carbon Footprint & Tax Calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ต้องครอบด้วย LanguageProvider แบบนี้เท่านั้น */}
        <LanguageProvider> 
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}