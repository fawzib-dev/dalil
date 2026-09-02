import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dalil-five.vercel.app"),
  title: "Dalīl | Qur'an & Sunnah Quiz",
  description: "Learn Islam through its evidence.",
  applicationName: "Dalīl",
  keywords: ["Qur'an", "Sunnah", "Islamic learning", "evidence-first learning"],
  openGraph: {
    title: "Dalīl | Qur'an & Sunnah Quiz",
    description: "Read the evidence. Test your understanding. Carry the lesson with you.",
    url: "https://dalil-five.vercel.app",
    siteName: "Dalīl",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
