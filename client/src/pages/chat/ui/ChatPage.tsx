import React from 'react';
import { Row, Col } from 'antd';
import { Chat } from './Chat';
import { CommonCheckList } from '@pages/chat';
import { MessageType, CheckListType } from '@shared/api';
import styles from './ChatPage.module.css';

interface ChatPageProps {
  messages: MessageType[];
  checkListItems: CheckListType[];
  currentUserId?: string | number;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  messages,
  checkListItems,
  currentUserId,
}) => {
  return (
    <div className={styles.chatPage}>
      <Row gutter={16} className={styles.pageRow}>
        <Col xs={24} lg={16} className={styles.chatColumn}>
          <Chat
            messages={messages}
            currentUserId={currentUserId}
            checkListItems={checkListItems}
          />
        </Col>
        <Col xs={24} lg={8} className={styles.checkListColumn}>
          <CommonCheckList checkListItems={checkListItems} />
        </Col>
      </Row>
    </div>
  );
};
