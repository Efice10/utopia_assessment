'use client';

import * as React from 'react';

import { Bot, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClear: () => void;
  isLoading?: boolean;
  messageCount?: number;
}

export function ChatHeader({ onClear, isLoading, messageCount = 0 }: ChatHeaderProps) {
  const hasMessages = messageCount > 0;

  return (
    <div className='flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'>
          <Bot className='h-5 w-5' />
        </div>
        <div>
          <h1 className='text-base font-semibold'>AI Assistant</h1>
          <p className='text-xs text-muted-foreground'>
            {hasMessages ? `${messageCount} messages` : 'Ask me anything about operations'}
          </p>
        </div>
      </div>

      {hasMessages ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              disabled={isLoading}
              className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all {messageCount} messages. The AI will lose all context from this conversation and cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClear} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                Clear all messages
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          disabled
          className='text-muted-foreground/50 cursor-not-allowed'
        >
          <Trash2 className='h-4 w-4 mr-2' />
          Clear
        </Button>
      )}
    </div>
  );
}
