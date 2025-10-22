import { io, Socket } from "socket.io-client";
import mitt from "mitt";

export const socketEvents = mitt();

let socket: Socket | null = null;

export const init_socket = (token?: string) => {
    // If no token provided, try localStorage
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
        console.warn("No auth token found. Cannot initialize socket.");
        return null;
    }

    // If an existing socket exists, and the token changed, disconnect and recreate
    if (socket && (socket.auth as any)?.token !== authToken) {
        console.log("Auth token changed, reconnecting socket...");
        socket.disconnect();
        socket = null;
    }


    if (!socket) {
        socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
            auth: { token: authToken },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        socket.on("new_message", (msg, ack) => {
            console.log("New message:", msg);
            const chatId = (msg as any)?.chatId ?? (msg as any)?.chat_id ?? (msg as any)?.chat?.id;

            // Ack immediately at transport layer to avoid UI timing issues
            if (typeof ack === "function") {
                try { ack(true); } catch (e) { console.warn("ack failed:", e); }
            }

            // Emit to UI
            socketEvents.emit("new_message", { chatId, message: msg });
        });

        // Also handle undelivered messages sent on reconnect
        socket.on("new_undelivered_message", (msg, ack) => {
            console.log("Undelivered message:", msg);
            const chatId = (msg as any)?.chatId ?? (msg as any)?.chat_id ?? (msg as any)?.chat?.id;

            if (typeof ack === "function") {
                try { ack(true); } catch (e) { console.warn("undelivered ack failed:", e); }
            }

            // Reuse same UI event so the screen updates identically
            socketEvents.emit("new_message", { chatId, message: msg });
        });
    }

    return socket;
};

export const get_socket = () => socket;

export const disconnect_socket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const reset_socket = (token?: string) => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    return init_socket(token);
};
