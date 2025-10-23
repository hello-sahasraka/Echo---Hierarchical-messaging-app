'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatForm from '../components/ChatForm';
import ChatMessage from '../components/ChatMessage';
import Image from 'next/image';
import { useSocket } from '../context/SocketContext';
import { socketEvents } from '../utils/socket';
import toast from 'react-hot-toast';
import { MessageCirclePlus } from 'lucide-react';

interface Sender {
  id: number;
  name: string;
}

interface Message {
  sender: Sender;
  sender_id: number;
  content: string;
  createdAt?: string;
  isRead?: boolean;
}

interface ChatItem {
  id: number;
  name: string;
  lastMessage: string;
  messages: Message[];
}

const Chat: React.FC = () => {
  const socket = useSocket();
  const [chats, setChats] = useState<ChatItem[]>([]);
  
    // { id: 1, name: 'Alex', lastMessage: 'Hey, how are you?', messages: [] },
    // { id: 2, name: 'Maya', lastMessage: 'Meeting at 3pm?', messages: [] },

  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [username, setUsername] = useState<string>('You');
  const [userId, setUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  //Load user data safely
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser.name || 'You');
      setUserId(parsedUser.id || null);
    }
  }, []);

  //Fetch chat List when socket connects
  useEffect(() => {
    if (!socket) return;

    const fetchChats = () => {
      socket.emit('get_all_chats', (response: { ok: boolean; chats: ChatItem[] }) => {
        if (response.ok) {
          setChats(response.chats);
          console.log(response.chats);
        } else {
          toast.error('Failed to fetch chats');
        }
      });
    };

    if (socket.connected) {
      fetchChats();
    } else {
      socket.once('connect', fetchChats);
    }

    const onNewMessage = (payload: any) => {
      const p = payload || {};
      const chatId = p.chatId ?? p.chat_id ?? p.message?.chat_id ?? p.message?.chatId;
      const rawMessage = p.message ?? p;
      if (!rawMessage) return;

      const normalizedMessage: Message = rawMessage.sender
        ? rawMessage
        : {
          ...rawMessage,
          sender: {
            id: rawMessage.sender_id ?? rawMessage.senderId ?? 0,
            name: rawMessage.sender_name ?? `User ${rawMessage.sender_id ?? rawMessage.senderId ?? 'unknown'}`,
          },
          sender_id: rawMessage.sender_id ?? rawMessage.senderId ?? 0,
          content: rawMessage.content ?? rawMessage.message ?? '',
          createdAt: rawMessage.createdAt ?? rawMessage.created_at,
        };

      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, normalizedMessage], lastMessage: normalizedMessage.content }
            : chat
        )
      );

      setActiveChat(prev =>
        prev && prev.id === chatId ? { ...prev, messages: [...prev.messages, normalizedMessage] } : prev
      );
    };

    const onMessagesRead = (payload: any) => {
      const { chatId, readBy } = payload;

      if (userId != null && String(readBy) === String(userId)) {
        // ignore if this client is the reader
        return;
      }

      setChats(prev =>
        prev.map(c =>
          c.id === chatId
            ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) }
            : c
        )
      );

      setActiveChat(prev =>
        !prev || prev.id !== chatId ? prev : { ...prev, messages: prev.messages.map(m => ({ ...m, isRead: true })) }
      );
    };

    // Subscribe to mitt bus (consistent with utils/socket.ts)
    socketEvents.on('new_message', onNewMessage);
    socketEvents.on('messages_read', onMessagesRead);

    return () => {
      socket.off('connect', fetchChats);
      socketEvents.off('new_message', onNewMessage);
      socketEvents.off('messages_read', onMessagesRead);
    };
  }, [socket, userId]);

  //Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  //Send message handler
  const handleSendMessage = (text: string) => {
    if (!activeChat || !socket || userId === null) return;

    socket.emit(
      'send_message',
      { chatId: activeChat.id, content: text },
      (response: { ok: boolean; error?: string }) => {
        if (!response.ok) {
          toast.error(response.error || 'Failed to send message');
        }
      }
    );

    const newMessage: Message = {
      sender: { id: userId, name: username },
      sender_id: userId,
      content: text,
      createdAt: new Date().toISOString(),
    };

    //Update chat list
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat.id
          ? {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: text,
          }
          : chat
      )
    );

    //Update active chat
    setActiveChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
    );
  };

  const handleActiveChat = (chat: ChatItem) => {

    setActiveChat(chat);
    if (!socket) {
      console.warn('Socket not available, cannot mark chat as read');
      return;
    }
    socket.emit("mark_read", { chatId: chat.id }, (ack: any) => {
      if (!ack.ok && ack.updatedCount > 0) {
        console.warn('Failed to mark messages as read on server');
        return;
      }

    });
  };

  const handleCreateChat = async () => {
    if (!socket) return;
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/createchat/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(`${data.message}`);
        throw new Error("Failed to create chat");
      }

      toast.success("Chat created successfully");

    } catch (e) {
      console.error("Error creating chat:", e);
    }
  };

  return (
    <div className="flex w-2/3 h-[600px] mt-12 border rounded shadow-md overflow-hidden bg-white relative">

      <div
        className='p-4 absolute bottom-0 left-0 cursor-pointer hover:scale-115 transition-transform inline-block'
        title='Create Chat'
        onClick={handleCreateChat}>
        <MessageCirclePlus size={45} />
      </div>

      {/* Chat List Section */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">ECHO</h1>
          <p className="text-sm text-gray-500">Say it once, Echo carries it all.</p>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleActiveChat(chat)}
              className={`p-3 cursor-pointer border-b hover:bg-gray-100 transition flex gap-4 ${activeChat?.id === chat.id ? 'bg-gray-200' : ''
                }`}
            >
              <div className="w-[40px] h-[40px] rounded-full font-semibold bg-gray-300 border flex justify-center items-center">
                {chat.name[0]}
              </div>
              <div>
                <div className="flex gap-2 items-center">
                  <p className="font-semibold">{chat.name}</p>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {!activeChat ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Image src="/Empty.png" alt="empty" width={200} height={200} />
            <p>Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b p-3 bg-gray-100">
              <h2 className="font-semibold">{activeChat.name}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {activeChat.messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.content}
                  sender={msg.sender.name}
                  isSystemMessage={msg.sender.name !== username}
                  createdAt={msg.createdAt}
                  isRead={msg.isRead ? true : false}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatForm onSend={handleSendMessage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
