import { useState } from 'react';
import { message } from 'antd';
import { ObjectData } from '@pages/objects/model/types';

export const useCreateObjectModal = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  const handleCreateObject = async (values: Partial<ObjectData>) => {
    setLoading(true);
    try {
      // TODO: Реализовать API вызов для создания объекта
      console.log('Creating object:', values);

      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Объект успешно создан!');
      closeModal();
    } catch (error) {
      console.error('Error creating object:', error);
      message.error('Ошибка при создании объекта');
    } finally {
      setLoading(false);
    }
  };

  return {
    visible,
    loading,
    openModal,
    closeModal,
    handleCreateObject,
  };
};
