import React from 'react';
import { Typography, Table, Input, Button, Space, Pagination } from 'antd';
import {
  AppstoreOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useObjectsPage } from '../hooks/useObjectsPage';
import styles from './ObjectsPage.module.css';
const { Title, Paragraph } = Typography;

export const ObjectsPage: React.FC = () => {
  const {
    searchText,
    columns,
    dataSource,
    currentPage,
    pageSize,
    handleSearch,
    handleSort,
    handleCreateObject,
    handlePageChange,
    handlePageSizeChange,
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

          <div className={styles.tableContainer}>
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey='id'
              pagination={false}
              className={styles.table}
            />
          </div>

          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={dataSource.length}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} из ${total} объектов`
              }
              onChange={handlePageChange}
              onShowSizeChange={handlePageSizeChange}
              className={styles.pagination}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
