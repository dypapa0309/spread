import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPREAD",
  description: "반응을 퍼뜨리고 전환을 만드는 미션 플랫폼"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
