import React from 'react';
import { Typography, Table, Input, Button, Space } from 'antd';
import {
  AppstoreOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useObjectsPage } from '../hooks/useObjectsPage';
import { CreateObjectModal } from '@features/create-object-modal';
import styles from './ObjectsPage.module.css';
const { Title, Paragraph } = Typography;

export const ObjectsPage: React.FC = () => {
  const {
    searchText,
    columns,
    dataSource,
    handleSearch,
    handleFilter,
    handleSort,
    handleCreateObject,
    createObjectModal,
  } = useObjectsPage();

  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.header}>
            <AppstoreOutlined className={styles.icon} />
            <Title level={2} className={styles.title}>
              Объекты
            </Title>
          </div>

          <Paragraph className={styles.description}>
            Список объектов проекта
          </Paragraph>

          <div className={styles.controlsBlock}>
            <Input
              placeholder='Поиск по объектам...'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={handleFilter}
                className={styles.controlButton}
              >
                Фильтр
              </Button>
              <Button
                icon={<SortAscendingOutlined />}
                onClick={handleSort}
                className={styles.controlButton}
              >
                Сортировка
              </Button>
            </Space>
          </div>

          <div className={styles.createButtonBlock}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleCreateObject}
              className={styles.createButton}
            >
              Создать объект
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='id'
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} из ${total} объектов`,
            }}
            className={styles.table}
          />
        </div>
      </div>

      <CreateObjectModal
        visible={createObjectModal.visible}
        onCancel={createObjectModal.closeModal}
        onOk={createObjectModal.handleCreateObject}
        loading={createObjectModal.loading}
      />
    </div>
  );
};
