'use client';

import React, { useState } from 'react'

interface ChatFormProps {
    onSend: (message: string) => void;
}


const ChatForm = ({ onSend }: ChatFormProps) => {
    const [message, setMessage] = useState("")

    const handleSend = () => {
        if (message.trim() === '') return;
        onSend(message);
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };


    return (
        <div className='flex justify-center gap-4 m-4'>
            <input
                type="text"
                placeholder="Type here"
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
            />
            <button
                className="btn btn-neutral rounded"
                onClick={handleSend}
            >Send</button>
        </div>
    )
}

export default ChatForm