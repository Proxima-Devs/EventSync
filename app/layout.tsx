import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from "@fortawesome/fontawesome-svg-core";
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";

config.autoAddCss = false

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventSync",
  description: "EventSync is a real-time event management and attendee engagement platform. It replaces static materials (PDF, paper programs) with a dynamic interface that makes it easy to navigate an event and interact with sessions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "fr";
  const messages = (await import(`@/translation/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
