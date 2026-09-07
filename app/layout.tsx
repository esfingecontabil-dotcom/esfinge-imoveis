import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Esfinge Imóveis",
  description: "Encontre seu imóvel no Paraná e Santa Catarina.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
        {/* Componente Oficial do Next.js */}
        <GoogleAnalytics gaId="G-XVD4BBDPY5" />
      </body>
    </html>
  );
}