import React from 'react';
import { Typography, Card, Button, Space, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useObjectEditPage } from '../hooks/useObjectEditPage';
import { ObjectChecklist } from '@features/object-checklist';
import styles from './ObjectEditPage.module.css';

const { Title, Paragraph } = Typography;

export const ObjectEditPage: React.FC = () => {
  const {
    objectData,
    loading,
    handleSave,
    handleBack,
    handleNameChange,
    handleAssigneeChange,
    name,
    assignee,
    checklist,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
  } = useObjectEditPage();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size='large' />
      </div>
    );
  }

  if (!objectData) {
    return (
      <div className={styles.errorContainer}>
        <Title level={3}>Объект не найден</Title>
        <Paragraph>Объект с указанным ID не существует</Paragraph>
        <Button type='primary' onClick={handleBack}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className={styles.backButton}
            >
              Назад
            </Button>
            <Title level={2} className={styles.title}>
              Редактирование объекта
            </Title>
          </div>

          <Card className={styles.editCard}>
            <div className={styles.editContent}>
              <div className={styles.editForm}>
                <Space
                  direction='vertical'
                  size='large'
                  style={{ width: '100%' }}
                >
                  <div>
                    <Title level={4}>Основная информация</Title>
                    <div className={styles.formItem}>
                      <label>ID объекта:</label>
                      <Paragraph code>{objectData.id}</Paragraph>
                    </div>
                    <div className={styles.formItem}>
                      <label>Название:</label>
                      <input
                        type='text'
                        value={name}
                        onChange={e => handleNameChange(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formItem}>
                      <label>Ответственный:</label>
                      <input
                        type='text'
                        value={assignee}
                        onChange={e => handleAssigneeChange(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formItem}>
                      <label>Прогресс:</label>
                      <Paragraph>{objectData.progress}%</Paragraph>
                    </div>
                    <div className={styles.formItem}>
                      <label>Тип:</label>
                      <Paragraph>
                        {objectData.type === 'project'
                          ? 'Проект'
                          : objectData.type}
                      </Paragraph>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <Space>
                      <Button
                        type='primary'
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                      >
                        Сохранить изменения
                      </Button>
                      <Button onClick={handleBack}>Отмена</Button>
                    </Space>
                  </div>
                </Space>
              </div>

              <div className={styles.checklistSection}>
                {checklist && (
                  <ObjectChecklist
                    checklist={checklist}
                    onToggleItem={handleToggleChecklistItem}
                    onAddItem={handleAddChecklistItem}
                    onEditItem={handleEditChecklistItem}
                    onDeleteItem={handleDeleteChecklistItem}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
