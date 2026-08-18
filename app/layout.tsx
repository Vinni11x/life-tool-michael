import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Michael Mäder, Life Tool",
  description: "Internes Tool für Termine, Aufgaben und alles Wichtige an einem Ort",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
