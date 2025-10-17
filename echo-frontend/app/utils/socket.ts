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
            // Try to derive chatId from common fields (chatId or chat_id)
            const chatId = (msg as any)?.chatId ?? (msg as any)?.chat_id ?? (msg as any)?.chat?.id;
            // Emit a normalized payload so listeners have both chatId and message,
            // and pass the ack function so the UI can acknowledge when ready.
            socketEvents.emit("new_message", { chatId, message: msg, ack });
            // Do NOT ack here immediately — let the UI ack when it's handled.
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
