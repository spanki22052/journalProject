import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ObjectData } from '@pages/objects/model/types';
import { CreateObjectModalProps, FormValues } from '../model/types';

const { Option } = Select;
const { TextArea } = Input;

export const CreateObjectModal: React.FC<CreateObjectModalProps> = ({
  visible,
  onCancel,
  onOk,
  loading = false,
}) => {
  const [form] = Form.useForm<FormValues>();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData: Partial<ObjectData> = {
        name: values.name,
        type: values.type,
        assignee: values.assignee,
        startDate: values.startDate?.toDate(),
        endDate: values.endDate?.toDate(),
        progress: 0,
        isExpanded: false,
      };
      onOk(formData);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          Создать новый объект
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText='Создать'
      cancelText='Отмена'
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          type: 'project',
        }}
      >
        <Form.Item
          name='name'
          label='Название объекта'
          rules={[
            { required: true, message: 'Пожалуйста, введите название объекта' },
            { min: 3, message: 'Название должно содержать минимум 3 символа' },
          ]}
        >
          <Input placeholder='Введите название объекта' />
        </Form.Item>

        <Form.Item
          name='type'
          label='Тип объекта'
          rules={[
            { required: true, message: 'Пожалуйста, выберите тип объекта' },
          ]}
        >
          <Select placeholder='Выберите тип объекта'>
            <Option value='project'>Проект</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='assignee'
          label='Ответственный'
          rules={[
            { required: true, message: 'Пожалуйста, введите ответственного' },
          ]}
        >
          <Input placeholder='Введите имя ответственного' />
        </Form.Item>

        <Form.Item name='description' label='Описание'>
          <TextArea
            rows={3}
            placeholder='Введите описание объекта (необязательно)'
          />
        </Form.Item>

        <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            name='startDate'
            label='Дата начала'
            rules={[
              { required: true, message: 'Пожалуйста, выберите дату начала' },
            ]}
            style={{ width: '50%', marginRight: 8 }}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder='Выберите дату начала'
            />
          </Form.Item>

          <Form.Item
            name='endDate'
            label='Дата окончания'
            rules={[
              {
                required: true,
                message: 'Пожалуйста, выберите дату окончания',
              },
            ]}
            style={{ width: '50%' }}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder='Выберите дату окончания'
            />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  );
};
