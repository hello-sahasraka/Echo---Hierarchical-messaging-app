import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const init_socket = () => {
    if (!socket) {
        const token = localStorage.getItem("token");
        socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
            auth: { token },
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        socket.on("reconnect_attempt", (attempt) => {
            console.log(`Reconnect attempt #${attempt}`);
        });

        socket.on("reconnect_failed", () => {
            console.log("Failed to reconnect after maximum attempts");
        });

        socket.on("connect", () => {
            console.log("Connected:", socket?.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("Disconnected:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
        });

        // Listen for new messages
        socket.on("new_message", (msg, ack) => {
            console.log("📩 New message:", msg);
            if (typeof ack === "function") ack(true); // confirm delivery
        });
        socket.connect();
    }

    return socket;
}

export const get_socket = () => socket;


