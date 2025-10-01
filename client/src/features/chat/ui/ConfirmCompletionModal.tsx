import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Space,
} from 'antd';
import {
  CheckCircleOutlined,
  CameraOutlined,
  UploadOutlined,
  FileOutlined,
} from '@ant-design/icons';
import {
  useConfirmCompletion,
  useObjectTasks,
  useUploadFile,
  ObjectTask,
} from '../../../shared/api/chatApi';
import styles from './ConfirmCompletionModal.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface ConfirmCompletionModalProps {
  visible: boolean;
  onCancel: () => void;
  chatId: string;
  objectId: string;
  author: string;
  onSuccess?: () => void;
}

export const ConfirmCompletionModal: React.FC<ConfirmCompletionModalProps> = ({
  visible,
  onCancel,
  chatId,
  objectId,
  author,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);

  const confirmCompletionMutation = useConfirmCompletion();
  const uploadFileMutation = useUploadFile();
  const { data: tasks = [], isLoading: tasksLoading } =
    useObjectTasks(objectId);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedTaskId('');
      setFileList([]);
    }
  }, [visible, form]);

  // Получаем только невыполненные задачи
  const incompleteTasks = tasks.filter(task => !task.completed);

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Используем заднюю камеру

    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newFile = {
          uid: Date.now().toString(),
          name: `camera_${Date.now()}.jpg`,
          status: 'done',
          originFileObj: file,
        };
        setFileList([newFile]);
      }
    };

    input.click();
  };

  const handleFileUpload = (info: any) => {
    setFileList(info.fileList);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedTaskId) {
        message.warning('Пожалуйста, выберите задачу');
        return;
      }

      if (fileList.length === 0) {
        message.warning('Пожалуйста, добавьте фото или документ');
        return;
      }

      setConfirmLoading(true);

      // Загружаем файлы в MinIO
      const uploadedFiles = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          try {
            const uploadResult = await uploadFileMutation.mutateAsync(
              file.originFileObj
            );
            uploadedFiles.push({
              url: uploadResult.fileUrl,
              name: uploadResult.fileName,
              size: uploadResult.fileSize,
            });
          } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            message.error(`Ошибка загрузки файла: ${file.name}`);
            return;
          }
        } else if (file.url) {
          uploadedFiles.push({
            url: file.url,
            name: file.name,
            size: file.size,
          });
        }
      }

      // Определяем тип сообщения на основе загруженных файлов
      const hasImages = uploadedFiles.some(
        f => f.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
      );
      const messageType = hasImages ? 'IMAGE' : 'FILE';

      // Берем первый файл для основных полей (пока поддерживаем только один файл)
      const firstFile = uploadedFiles[0];

      const completionData = {
        content: values.content,
        author,
        taskId: selectedTaskId,
        type: messageType,
        fileUrl: firstFile?.url,
        fileName: firstFile?.name,
        fileSize: firstFile?.size,
      };

      console.log('Sending completion data:', completionData);

      await confirmCompletionMutation.mutateAsync({
        chatId,
        data: completionData,
      });

      message.success('Выполнение задачи подтверждено');
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Ошибка при подтверждении выполнения:', error);
      message.error('Ошибка при подтверждении выполнения');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedTaskId('');
    setFileList([]);
    onCancel();
  };

  const getTaskDisplayText = (task: ObjectTask) => {
    return `${task.text}`;
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <CheckCircleOutlined className={styles.titleIcon} />
          Подтвердить выполнение
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading || confirmCompletionMutation.isPending}
      okText='Подтвердить выполнение'
      cancelText='Отмена'
      width={500}
      className={styles.modal}
    >
      <Form form={form} layout='vertical' className={styles.form}>
        <Form.Item
          name='taskId'
          label='Выберите задачу для подтверждения'
          rules={[{ required: true, message: 'Пожалуйста, выберите задачу' }]}
        >
          <Select
            placeholder='Выберите невыполненную задачу'
            loading={tasksLoading}
            value={selectedTaskId}
            onChange={setSelectedTaskId}
            className={styles.taskSelect}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase()) ?? false
            }
          >
            {incompleteTasks.map(task => (
              <Option key={task.id} value={task.id}>
                {getTaskDisplayText(task)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name='content'
          label='Комментарий к выполнению'
          rules={[
            { required: true, message: 'Пожалуйста, добавьте комментарий' },
            {
              max: 500,
              message: 'Комментарий не должен превышать 500 символов',
            },
          ]}
        >
          <TextArea
            placeholder='Опишите выполненную работу...'
            rows={3}
            className={styles.textArea}
          />
        </Form.Item>

        <Form.Item label='Добавить фото или документ' required>
          <Space direction='vertical' style={{ width: '100%' }}>
            <Space>
              <Button
                icon={<CameraOutlined />}
                onClick={handleCameraCapture}
                className={styles.cameraButton}
              >
                Сфотографировать
              </Button>
              <Upload
                accept='image/*,.pdf,.doc,.docx'
                fileList={fileList}
                onChange={handleFileUpload}
                beforeUpload={() => false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Загрузить файл</Button>
              </Upload>
            </Space>

            {fileList.length > 0 && (
              <div className={styles.filePreview}>
                {fileList.map(file => (
                  <div key={file.uid} className={styles.fileItem}>
                    <FileOutlined className={styles.fileIcon} />
                    <span className={styles.fileName}>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
