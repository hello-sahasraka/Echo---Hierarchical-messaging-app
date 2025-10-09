import db from "../models/sequelize.js";

const Chat = db.chats;
const Participant = db.participants;

export const create_chat = async (userId, subordinateIds) => {
    const exsisting = await Chat.findOne({
        where: {creator_id : userId}
    })

    if (exsisting) throw new Error("You must delete the existing chat first") 
        
    const chat = await Chat.create({creator_id: userId, })

    await Participant.bulkCreate([
        {chat_id: chat.id, user_id: userId, role: "creator"},
        ...subordinateIds.map((id) => ({chat_id: chat.id, user_id: id, role: "subordinater"}))
    ])
}

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
