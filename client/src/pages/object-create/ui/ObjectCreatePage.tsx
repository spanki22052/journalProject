import React from 'react';
import {
  Typography,
  Card,
  Button,
  Space,
  Spin,
  Select,
  Input,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { useObjectCreatePage } from '../hooks/useObjectCreatePage';
import { ObjectChecklist } from '@features/object-checklist';
import { MapDrawer } from '@features/map-drawer/MapDrawer';
import { mockAssignees } from '@shared/api/mockData';
import styles from './ObjectCreatePage.module.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const ObjectCreatePage: React.FC = () => {
  const {
    loading,
    name,
    assignee,
    description,
    startDate,
    endDate,
    checklist,
    polygonCoords,
    handleNameChange,
    handleAssigneeChange,
    handleDescriptionChange,
    handleStartDateChange,
    handleEndDateChange,
    handleSave,
    handleBack,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
    handleCreateChecklist,
    setPolygonCoords,
  } = useObjectCreatePage();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size='large' />
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
              Создание объекта
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
                      <label>Название *</label>
                      <input
                        type='text'
                        value={name}
                        onChange={e => handleNameChange(e.target.value)}
                        className={styles.input}
                        placeholder='Введите название объекта'
                      />
                    </div>
                    <div className={styles.formItem}>
                      <label>Ответственный</label>
                      <Select
                        value={assignee}
                        onChange={handleAssigneeChange}
                        className={styles.select}
                        placeholder='Выберите ответственного'
                        allowClear
                      >
                        {mockAssignees.map(assignee => (
                          <Option key={assignee} value={assignee}>
                            {assignee}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className={styles.formItem}>
                      <label>Описание</label>
                      <TextArea
                        value={description}
                        onChange={e => handleDescriptionChange(e.target.value)}
                        className={styles.textarea}
                        placeholder='Введите описание объекта'
                        rows={4}
                      />
                    </div>
                    <div className={styles.formItem}>
                      <label>Дата начала *</label>
                      <input
                        type='date'
                        value={startDate}
                        onChange={e => handleStartDateChange(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formItem}>
                      <label>Дата окончания *</label>
                      <input
                        type='date'
                        value={endDate}
                        onChange={e => handleEndDateChange(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <Divider />

                  <div className={styles.formItem}>
                    <label>Географическая область объекта</label>
                    <MapDrawer
                      polygonCoords={polygonCoords}
                      setPolygonCoords={setPolygonCoords}
                    />
                  </div>
                </Space>
              </div>

              <div className={styles.checklistSection}>
                {!checklist ? (
                  <div className={styles.checklistEmpty}>
                    <CheckSquareOutlined
                      className={styles.checklistEmptyIcon}
                    />
                    <Paragraph>Чеклист не создан</Paragraph>
                    <Button
                      type='dashed'
                      icon={<PlusOutlined />}
                      onClick={handleCreateChecklist}
                      className={styles.createChecklistButton}
                    >
                      Создать чеклист
                    </Button>
                  </div>
                ) : (
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

            <div className={styles.actions}>
              <Space>
                <Button
                  type='primary'
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={loading}
                >
                  Создать объект
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
