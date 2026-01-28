/*
    Aaxion Drive - Your own local Google Drive
    Copyright (C) 2026 Swapnil Ingle
*/

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Aaxion Drive - Personal Cloud Storage",
    description: "Modern, high-performance file storage and management system",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-[#121212] text-white overflow-hidden flex flex-col h-screen`}>
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