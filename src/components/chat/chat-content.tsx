'use client';

import * as React from 'react';

import { useAIQueryStream } from '@/hooks/use-ai-query';
import { useChatStore } from '@/lib/stores/chat-store';

import { ChatEmptyState } from './chat-empty-state';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';

export function ChatContent() {
  const { messages, isLoading, addMessage, appendToLastMessage, finishStreaming, setLoading, setError, clearMessages } =
    useChatStore();

  const { mutate: sendMessage } = useAIQueryStream();

  const handleSendMessage = (content: string) => {
    // Build conversation history from previous messages (excluding the current message)
    const history = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Add user message
    addMessage({
      role: 'user',
      content,
    });

    // Add placeholder for assistant message
    addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    });

    setLoading(true);
    setError(null);

    // Send message with history and stream response
    sendMessage(
      {
        question: content,
        history,
        onChunk: (chunk) => {
          appendToLastMessage(chunk);
        },
      },
      {
        onSuccess: () => {
          finishStreaming();
        },
        onError: (error) => {
          finishStreaming();
          setError(error.message || 'Failed to get response');
          // Update the last message to show error
          const { messages: currentMessages, updateLastMessage } = useChatStore.getState();
          if (currentMessages.length > 0) {
            updateLastMessage('Sorry, I encountered an error. Please try again.');
          }
        },
      }
    );
  };

  const handleClearChat = () => {
    clearMessages();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className='flex h-full flex-col'>
      {/* Header - Sticky at top */}
      <div className='sticky top-0 z-10 shrink-0'>
        <ChatHeader onClear={handleClearChat} isLoading={isLoading} messageCount={messages.length} />
      </div>

      {/* Messages area - Scrollable */}
      <div className='flex-1 overflow-y-auto'>
        {hasMessages ? (
          <ChatMessages messages={messages} isLoading={isLoading} className='h-full' />
        ) : (
          <ChatEmptyState onSelectQuery={handleSendMessage} className='h-full' />
        )}
      </div>

      {/* Input area - Sticky at bottom */}
      <div className='sticky bottom-0 z-10 shrink-0 border-t bg-background p-4'>
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
