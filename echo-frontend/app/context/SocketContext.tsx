"use client";

import { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { init_socket, disconnect_socket } from "../utils/socket";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // read on client mount
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  // Poll localStorage for same-tab token changes (works when login sets localStorage in same tab)
  useEffect(() => {
    let mounted = true;
    const checkToken = () => {
      try {
        const latest = localStorage.getItem("token");
        if (mounted && latest !== token) {
          setToken(latest);
        }
      } catch { }
    };
    const id = setInterval(checkToken, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [token]);

  // Also listen for cross-tab changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") setToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Initialize socket when token changes
  useEffect(() => {
    if (!token) {
      disconnect_socket();
      setSocket(null);
      return;
    }

    const s = init_socket(token);
    setSocket(s);

    return () => {
      disconnect_socket();
      setSocket(null);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
