import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useSuggestEdit, useObjectTasks, ObjectTask } from '../../../shared/api/chatApi';
import styles from './SuggestEditModal.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface SuggestEditModalProps {
  visible: boolean;
  onCancel: () => void;
  chatId: string;
  objectId: string;
  author: string;
  onSuccess?: () => void;
}

export const SuggestEditModal: React.FC<SuggestEditModalProps> = ({
  visible,
  onCancel,
  chatId,
  objectId,
  author,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  const suggestEditMutation = useSuggestEdit();
  const { data: tasks = [], isLoading: tasksLoading } = useObjectTasks(objectId);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedTaskId('');
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedTaskId) {
        message.warning('Пожалуйста, выберите задачу');
        return;
      }

      setConfirmLoading(true);
      
      await suggestEditMutation.mutateAsync({
        chatId,
        data: {
          content: values.content,
          author,
          taskId: selectedTaskId,
        },
      });

      message.success('Предложение правки отправлено');
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Ошибка при отправке предложения правки:', error);
      message.error('Ошибка при отправке предложения правки');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedTaskId('');
    onCancel();
  };

  const getTaskDisplayText = (task: ObjectTask) => {
    const status = task.completed ? '✓' : '○';
    return `${status} ${task.text}`;
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <EditOutlined className={styles.titleIcon} />
          Предложить правку
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading || suggestEditMutation.isPending}
      okText="Отправить предложение"
      cancelText="Отмена"
      width={600}
      className={styles.modal}
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
      >
        <Form.Item
          name="taskId"
          label="Выберите задачу"
          rules={[{ required: true, message: 'Пожалуйста, выберите задачу' }]}
        >
          <Select
            placeholder="Выберите задачу для предложения правки"
            loading={tasksLoading}
            value={selectedTaskId}
            onChange={setSelectedTaskId}
            className={styles.taskSelect}
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase()) ?? false
            }
          >
            {tasks.map((task) => (
              <Option key={task.id} value={task.id}>
                {getTaskDisplayText(task)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="Предложение правки"
          rules={[
            { required: true, message: 'Пожалуйста, введите предложение правки' },
            { max: 1000, message: 'Предложение не должно превышать 1000 символов' },
          ]}
        >
          <TextArea
            placeholder="Опишите предлагаемые изменения..."
            rows={4}
            className={styles.textArea}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
