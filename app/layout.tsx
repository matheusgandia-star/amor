import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amor em Dia — Sabonetes Artesanais",
  description: "Sabonetes artesanais naturais feitos com amor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
