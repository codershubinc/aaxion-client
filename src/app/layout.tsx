/*
    Aaxion Drive - Your own local Google Drive
    Copyright (C) 2026 Swapnil Ingle
*/

import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const cursive = Dancing_Script({ subsets: ["latin"], weight: "700", variable: '--font-cursive' });

export const metadata: Metadata = {
    title: "Aaxion Drive - Personal Cloud Storage",
    description: "Transform your old hardware into a high-performance personal cloud. Secure, fast, and lightweight file management system.",
    applicationName: "Aaxion Drive",
    authors: [{ name: "Swapnil Ingle", url: "https://github.com/codershubinc" }],
    keywords: ["personal cloud", "file storage", "self-hosted", "google drive alternative", "aaxion", "tauri", "nextjs"],
    icons: {
        icon: "/favicon.ico",
    },
    openGraph: {
        title: "Aaxion Drive - Personal Cloud Storage",
        description: "Transform your old hardware into a high-performance personal cloud. Secure, fast, and lightweight file management system.",
        type: "website",
        locale: "en_US",
        siteName: "Aaxion Drive",
    },
    twitter: {
        card: "summary_large_image",
        title: "Aaxion Drive - Personal Cloud Storage",
        description: "Transform your old hardware into a high-performance personal cloud. Secure, fast, and lightweight file management system.",
    },
    appLinks: {
        web: {
            url: "https://aaxion.codershubinc.com",
        },

    },
    robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${cursive.variable} font-sans bg-[#121212] text-white overflow-hidden flex flex-col h-screen`}>
                <AppProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            className: 'glass-effect border border-dark-border',
                            style: {
                                background: '#141414',
                                color: '#e5e5e5',
                            },
                        }}
                    />
                    {/*  The Main Content Area   */}
                    <div className="flex-1 w-full overflow-hidden relative">
                        {children}
                    </div>
                </AppProvider>
            </body>
        </html>
    );
} 