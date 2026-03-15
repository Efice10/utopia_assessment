'use client';

import * as React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { ChatMessage } from './chat-message';
import { ChatTypingIndicator } from './chat-typing-indicator';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  className?: string;
}

export function ChatMessages({ messages, isLoading, className }: ChatMessagesProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div ref={containerRef} className={className}>
      <ScrollArea className='h-full'>
        <div className='flex flex-col gap-4 p-4'>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <ChatTypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
