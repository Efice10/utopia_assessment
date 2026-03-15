import { ChatContent } from '@/components/chat';

import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'AI Assistant',
  description: 'Ask questions about service orders, technicians, and business performance.',
};

export default function AIAssistantPage() {
  return (
    <div className='h-[calc(100vh-4rem)]'>
      <ChatContent />
    </div>
  );
}
