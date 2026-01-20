import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Footer } from "../components/Footer";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "OnboardHub | Winter of Code 5.0",
    description: "Data-driven insights to help you merge your first PR in seconds. Analyze repos, find issues, and draft applications.",
    openGraph: {
        title: "OnboardHub - Hackathon Ready",
        description: "Don't just stare at CONTRIBUTING.md. Start coding with our intelligent repo analyzer.",
        type: "website",
        siteName: "OnboardHub",
    },
    keywords: ["hackathon", "open source", "beginner friendly", "github analysis"],
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                {children}
                <Footer />
            </body>
        </html>
    );
}
