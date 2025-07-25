import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth-context";
import AnimatedTooltip from "@/components/Bonbon";

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: "Boundless",
  description: "Breaking Barriers to Global Education",
  icons: {
    icon: '/favicon.ico', 
    shortcut: '/logo.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <Navbar className="sticky top-0 z-50" />
          {children}
          <AnimatedTooltip />
        </AuthProvider>
      </body>
    </html>
  );
}
