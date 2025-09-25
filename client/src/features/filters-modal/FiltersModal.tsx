import React from 'react';
import { Modal, Space } from 'antd';
import { OrganizationSelector } from '@features/organization-selector/OrganizationSelector';
import { WorkSelector } from '@features/work-selector/WorkSelector';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOrganization?: string;
  selectedWorks: string[];
  onOrganizationChange: (value: string) => void;
  onWorksChange: (value: string[]) => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  selectedOrganization,
  selectedWorks,
  onOrganizationChange,
  onWorksChange,
}) => {
  return (
    <Modal
      title='Фильтры'
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
    >
      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        <OrganizationSelector
          value={selectedOrganization}
          onChange={onOrganizationChange}
        />
        <WorkSelector value={selectedWorks} onChange={onWorksChange} />
      </Space>
    </Modal>
  );
};
