import React from 'react';
import { Select } from 'antd';
import { mockWorks } from '@shared/api/mockData';
import styles from './WorkSelector.module.css';

interface WorkSelectorProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const WorkSelector: React.FC<WorkSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Выберите виды работ',
}) => {
  const options = mockWorks.map(work => ({
    value: work,
    label: work,
  }));

  return (
    <div className={styles.container}>
      <label className={styles.label}>Виды работ:</label>
      <Select
        mode='multiple'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        options={options}
        className={styles.select}
        size='large'
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        maxTagCount='responsive'
      />
    </div>
  );
};
