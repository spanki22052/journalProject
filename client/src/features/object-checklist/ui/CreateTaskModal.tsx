import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './CreateTaskModal.module.css';

const { TextArea } = Input;
const { Option } = Select;

export interface CreateTaskFormData {
  title: string;
  description?: string;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  priority: 'low' | 'medium' | 'high';
}

interface CreateTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (data: CreateTaskFormData) => Promise<void>;
  loading?: boolean;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      await onConfirm(values);
      form.resetFields();
      message.success('Задача успешно создана');
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      message.error('Ошибка при создании задачи');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <PlusOutlined className={styles.titleIcon} />
          Создать новую задачу
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading || loading}
      okText='Создать'
      cancelText='Отмена'
      width={600}
      className={styles.modal}
    >
      <Form
        form={form}
        layout='vertical'
        className={styles.form}
        initialValues={{
          priority: 'medium',
        }}
      >
        <Form.Item
          name='title'
          label='Название задачи'
          rules={[
            { required: true, message: 'Пожалуйста, введите название задачи' },
            { max: 200, message: 'Название не должно превышать 200 символов' },
          ]}
        >
          <Input
            placeholder='Введите название задачи'
            className={styles.input}
          />
        </Form.Item>

        <Form.Item
          name='description'
          label='Описание'
          rules={[
            {
              max: 1000,
              message: 'Описание не должно превышать 1000 символов',
            },
          ]}
        >
          <TextArea
            placeholder='Введите описание задачи (необязательно)'
            rows={3}
            className={styles.textArea}
          />
        </Form.Item>

        <Space.Compact className={styles.dateRow}>
          <Form.Item
            name='startDate'
            label='Дата начала'
            className={styles.dateField}
          >
            <DatePicker
              placeholder='Выберите дату начала'
              className={styles.datePicker}
              format='DD.MM.YYYY'
            />
          </Form.Item>

          <Form.Item
            name='endDate'
            label='Дата окончания'
            className={styles.dateField}
          >
            <DatePicker
              placeholder='Выберите дату окончания'
              className={styles.datePicker}
              format='DD.MM.YYYY'
            />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name='priority'
          label='Приоритет'
          rules={[
            { required: true, message: 'Пожалуйста, выберите приоритет' },
          ]}
        >
          <Select placeholder='Выберите приоритет' className={styles.select}>
            <Option value='low'>
              <span className={styles.priorityOption}>
                <span className={`${styles.priorityDot} ${styles.low}`}></span>
                Низкий
              </span>
            </Option>
            <Option value='medium'>
              <span className={styles.priorityOption}>
                <span
                  className={`${styles.priorityDot} ${styles.medium}`}
                ></span>
                Средний
              </span>
            </Option>
            <Option value='high'>
              <span className={styles.priorityOption}>
                <span className={`${styles.priorityDot} ${styles.high}`}></span>
                Высокий
              </span>
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
