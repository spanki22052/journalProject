import React from 'react';
import { Select } from 'antd';
import { mockOrganizations } from '@shared/api/mockData';
import styles from './OrganizationSelector.module.css';

interface OrganizationSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Выберите организацию',
}) => {
  const options = mockOrganizations.map(org => ({
    value: org.id,
    label: org.name,
  }));

  return (
    <div className={styles.container}>
      <label className={styles.label}>Организация:</label>
      <Select
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
      />
    </div>
  );
};
