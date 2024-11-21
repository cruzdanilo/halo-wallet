import type { Metadata } from "next";
import React, { type ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "halo wallet",
  description: "own your arx halo",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
