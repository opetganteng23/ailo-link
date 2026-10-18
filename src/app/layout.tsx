import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const title = "ailo.ai.id: Shorten Links. Amplify Impact";
const description =
  "Create short links and QR Codes with AI Labs. Share your ideas, track engagement, and turn every click into a meaningful connection.";

export const metadata: Metadata = {
  title,
  description,
  // Shown when the link is shared (WhatsApp, Slack, social).
  openGraph: { title, description, siteName: "ailo.ai.id", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
