'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatForm from '../components/ChatForm';
import ChatMessage from '../components/ChatMessage';
import Image from 'next/image';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

interface Sender {
  id: number;
  name: string;
}

interface Message {
  sender: Sender;
  sender_id: number;
  content: string;
  createdAt?: string;
}

interface ChatItem {
  id: number;
  name: string;
  lastMessage: string;
  messages: Message[];
}

const Chat: React.FC = () => {
  const socket = useSocket();
  const [chats, setChats] = useState<ChatItem[]>([
    { id: 1, name: 'Alex', lastMessage: 'Hey, how are you?', messages: [] },
    { id: 2, name: 'Maya', lastMessage: 'Meeting at 3pm?', messages: [] },
  ]);

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
        } else {
          toast.error('Failed to fetch chats');
        }
      });
    };

    // fetch immediately if already connected, otherwise wait for connect
    if (socket.connected) {
      fetchChats();
    } else {
      socket.once('connect', fetchChats);
    }

    // Listen for real-time messages from server.
    const onNewMessage = (payload: { chatId: number; message: Message }) => {
      const { chatId, message } = payload;

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, message], lastMessage: message.content }
            : c
        )
      );

      setActiveChat((prev) =>
        prev && prev.id === chatId ? { ...prev, messages: [...prev.messages, message] } : prev
      );
    };

    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('connect', fetchChats);
      socket.off('new_message', onNewMessage);
    };
  }, [socket]);

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

  return (
    <div className="flex w-2/3 h-[600px] mt-12 border rounded shadow-md overflow-hidden bg-white">
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
              onClick={() => setActiveChat(chat)}
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
