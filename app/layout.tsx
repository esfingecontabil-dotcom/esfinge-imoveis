import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Esfinge Imóveis | Guardião de Imóveis",
  description: "Vendas, Locação Anual e Casas de Temporada no Litoral e Maringá.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-neutral-950 text-neutral-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}