'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatForm from '../components/ChatForm';
import ChatMessage from '../components/ChatMessage';

interface Message {
  sender: string;
  message: string;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  messages: Message[];
}

const Chat: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: 'Alex', lastMessage: 'Hey, how are you?', messages: [] },
    { id: 2, name: 'Maya', lastMessage: 'Meeting at 3pm?', messages: [] },
  ]);


  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [username] = useState('You');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSendMessage = (text: string) => {
    if (!activeChat) return;

    const newMessage: Message = { sender: username, message: text };
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

    setActiveChat((prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, newMessage] }
        : prev
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
      className={`p-3 cursor-pointer border-b hover:bg-gray-100 transition flex gap-4 ${
        activeChat?.id === chat.id ? 'bg-gray-200' : ''
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
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a chat to start messaging
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
                  message={msg.message}
                  sender={msg.sender}
                  isSystemMessage={msg.sender !== username}
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
