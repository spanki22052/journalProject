import React from 'react';
import {
  Typography,
  Table,
  Input,
  Button,
  Space,
  Pagination,
  Spin,
  Alert,
} from 'antd';
import {
  AppstoreOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  PlusOutlined,
  ReloadOutlined,
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
    totalObjects,
    isLoading,
    error,
    handleSearch,
    handleSort,
    handleCreateObject,
    handlePageChange,
    handlePageSizeChange,
    refetch,
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
              disabled={isLoading}
            />
            <Space>
              <Button
                icon={<SortAscendingOutlined />}
                onClick={handleSort}
                className={styles.controlButton}
                disabled={isLoading}
              >
                Сортировка
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                className={styles.controlButton}
                loading={isLoading}
              >
                Обновить
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

          {error && (
            <Alert
              message='Ошибка загрузки объектов'
              description={
                error.message || 'Произошла ошибка при загрузке данных'
              }
              type='error'
              showIcon
              action={
                <Button size='small' onClick={() => refetch()}>
                  Повторить
                </Button>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          <div className={styles.tableContainer}>
            <Spin spinning={isLoading} tip='Загрузка объектов...'>
              <Table
                columns={columns}
                dataSource={dataSource}
                rowKey='id'
                pagination={false}
                className={styles.table}
                locale={{
                  emptyText: isLoading ? 'Загрузка...' : 'Объекты не найдены',
                }}
              />
            </Spin>
          </div>

          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalObjects}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} из ${total} объектов`
              }
              onChange={handlePageChange}
              onShowSizeChange={handlePageSizeChange}
              className={styles.pagination}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
