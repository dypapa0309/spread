import type { Metadata } from "next";
import { Suspense } from "react";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPREAD",
  description: "반응을 퍼뜨리고 전환을 만드는 미션 플랫폼"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
