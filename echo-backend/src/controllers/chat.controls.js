import db from "../models/sequelize.js";
import { get_subordinates } from "./user.controls.js";

const Chat = db.chats;
const Participant = db.participants;

export const create_chat = async (req, res) => {
    try {
        const { userId } = req.body;

        const subordinates = await get_subordinates(userId);
        if (!subordinates || subordinates.length === 0) {
            return res.status(400).json({ message: "No subordinates found." });
        }

        const existing = await Chat.findOne({ where: { creator_id: userId } });
        if (existing) {
            return res.status(400).json({ message: "You must delete the existing chat first." });
        }

        const chat = await Chat.create({ creator_id: userId });

        // Remove duplicate subordinates by unique user_id
        const uniqueSubs = [
            ...new Map(subordinates.map(sub => [sub.id, sub])).values()
        ];


        // Prepare participant list (creator + subordinates)
        const participants = [
            { chat_id: chat.id, user_id: userId, role: "creator", joined_at: new Date() },
            ...uniqueSubs.map(sub => ({
                chat_id: chat.id,
                user_id: sub.id,
                role: "subordinate",
                joined_at: new Date(),
            })),
        ];
        // const participants = [
        //     { chat_id: chat.id, user_id: userId, role: "creator", joined_at: new Date() },
        //     ...subordinates.map(sub => ({
        //         chat_id: chat.id,
        //         user_id: sub.id,
        //         role: "subordinate",
        //         joined_at: new Date(),
        //     })),
        // ];

        // Insert participants
        await Participant.bulkCreate(participants);

        // Respond with success
        res.status(201).json({
            message: "Chat created successfully.",
            chat,
            participants,
        });

    } catch (err) {
        console.error("Error creating chat:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const get_chat_list = async (userId) => {
    try {
        const chats = await Chat.findAll({
            include: [
                {
                    model: Message,
                    as: "messages",
                    order: [["createdAt", "DESC"]],
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"]
                }
            ],
            order: [["id", "DESC"]],
        });

        //Format for frontend
        const chatList = chats.map(chat => {
            let participantName = chat.creator.id === userId ? "You" : chat.creator.name;
            const lastMessage = chat.messages.length ? chat.messages[chat.messages.length - 1].content : "";
            return {
                id: chat.id,
                name: participantName,
                lastMessage,
                messages: chat.messages
            };
        });

        return chatList;
    } catch (err) {
        console.error("Error fetching chat list:", err);
        throw err;
    }
};
