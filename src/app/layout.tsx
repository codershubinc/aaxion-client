import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Aaxion - File Storage & Management",
    description: "Modern file storage and management system",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
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
                {children}
            </body>
        </html>
    );
}
