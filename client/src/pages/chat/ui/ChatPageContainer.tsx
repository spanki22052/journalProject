import React from 'react';
import { ChatPage } from './ChatPage';
import { useChatPage } from '../hooks/useChatPage';

export const ChatPageContainer: React.FC = () => {
  const { messages, checkListItems } = useChatPage();

  return (
    <ChatPage
      messages={messages}
      checkListItems={checkListItems}
      currentUserId={1}
    />
  );
};
