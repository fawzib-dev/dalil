import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dalīl | Qur'an & Sunnah Quiz",
  description: "Learn Islam through its evidence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
