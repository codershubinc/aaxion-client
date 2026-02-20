"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface TitleBarContextType {
    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;
}

const TitleBarContext = createContext<TitleBarContextType | undefined>(undefined);

export function TitleBarProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState<ReactNode | null>(null);

    return (
        <TitleBarContext.Provider value={{ content, setContent }}>
            {children}
        </TitleBarContext.Provider>
    );
}

export function useTitleBar() {
    const context = useContext(TitleBarContext);
    if (!context) {
        throw new Error('useTitleBar must be used within TitleBarProvider');
    }
    return context;
}
