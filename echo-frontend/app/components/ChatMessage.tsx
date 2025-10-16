import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
    message: string;
    sender?: string; // optional, for system messages
    isSystemMessage?: boolean;
    createdAt?: string;
}

const ChatMessage = ({
    message,
    sender = 'System',
    isSystemMessage = false,
    createdAt,
}: ChatMessageProps) => {
    return (
        <div
            className={`flex ${isSystemMessage ? 'justify-start' : 'justify-end'} p-2`}
        >
            {isSystemMessage ?
                <div className="chat chat-start">
                    <div className="chat-header">
                        {sender}
                        <time className="text-xs opacity-50">
                            {createdAt ? `${formatDistanceToNow(new Date(createdAt))} ago` : ''}
                        </time>
                    </div>
                    <div className="chat-bubble">{message}</div>
                    <div className="chat-footer opacity-50">Seen</div>
                </div>
                :
                <div className="chat chat-end">
                    <div className="chat-header">
                        You
                        <time className="text-xs opacity-50">2 hours ago</time>
                    </div>
                    <div className="chat-bubble chat-bubble-neutral">{message}</div>
                    <div className="chat-footer opacity-50">Seen</div>
                </div>
            }
        </div>
    );
};

export default ChatMessage;
