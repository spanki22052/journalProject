import React from 'react';
import { Typography, Card, Button, Space, Spin, Select, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useObjectEditPage } from '../hooks/useObjectEditPage';
import { ObjectChecklist } from '@features/object-checklist';
import { mockAssignees } from '@shared/api/mockData';
import styles from './ObjectEditPage.module.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const ObjectEditPage: React.FC = () => {
  const {
    objectData,
    loading,
    error,
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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message='Ошибка загрузки объекта'
          description={
            error.message || 'Произошла ошибка при загрузке данных объекта'
          }
          type='error'
          showIcon
          action={
            <Button size='small' onClick={handleBack}>
              Вернуться к списку
            </Button>
          }
        />
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
                      <Select
                        value={assignee}
                        onChange={handleAssigneeChange}
                        className={styles.select}
                        placeholder='Выберите ответственного'
                        allowClear
                        style={{ minWidth: '300px' }}
                      >
                        {mockAssignees.map(assignee => (
                          <Option key={assignee} value={assignee}>
                            {assignee}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </Space>
              </div>

              <div className={styles.checklistSection}>
                <ObjectChecklist
                  checklist={checklist}
                  onToggleItem={handleToggleChecklistItem}
                  onAddItem={handleAddChecklistItem}
                  onEditItem={handleEditChecklistItem}
                  onDeleteItem={handleDeleteChecklistItem}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Space>
                <Button
                  type='primary'
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={loading}
                >
                  Сохранить изменения
                </Button>
                <Button onClick={handleBack}>Отмена</Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
