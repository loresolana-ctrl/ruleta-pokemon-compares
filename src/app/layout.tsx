import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruleta Pokémon — 30 Aniversario",
  description: "¡Gana premios sorpresa con la ruleta del 30 aniversario!",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="es" className={`${bangers.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
