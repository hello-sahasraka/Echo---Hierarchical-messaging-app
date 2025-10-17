'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

const LoggedContext = createContext<{
    logged: boolean;
    setLogged: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const LoggedProvider = ({ children }: { children: React.ReactNode }) => {
    const [logged, setLogged] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setLogged(true);  // ✅ auto-login if token exists
    }, []);

    return (
        <LoggedContext.Provider value={{ logged, setLogged }}>
            {children}
        </LoggedContext.Provider>
    );
};

export const useLogged = () => {
    const context = useContext(LoggedContext);
    if (!context) {
        throw new Error('useLogged must be used within a LoggedProvider');
    }
    return context;
};
