import React from 'react';
import { Layout } from 'antd';
import { Navigation } from '@widgets/navigation/Navigation';
import { GanntTable } from '@widgets/gannt-table';
import { FiltersModal } from '@features/filters-modal/FiltersModal';
import { useMainPage } from '../hooks/useMainPage';
import styles from './MainPage.module.css';

const { Content } = Layout;

export const MainPage: React.FC = () => {
  const {
    selectedOrganization,
    selectedWorks,
    filtersModalVisible,
    setSelectedOrganization,
    setSelectedWorks,
    handleOpenFilters,
    handleCloseFilters,
  } = useMainPage();

  return (
    <Layout className={styles.layout}>
      <Navigation />
      <Content className={styles.content}>
        <div className={styles.container}>
          <GanntTable
            selectedOrganization={selectedOrganization}
            selectedWorks={selectedWorks}
            onOpenFilters={handleOpenFilters}
          />
        </div>
        <FiltersModal
          visible={filtersModalVisible}
          onClose={handleCloseFilters}
          selectedOrganization={selectedOrganization}
          selectedWorks={selectedWorks}
          onOrganizationChange={setSelectedOrganization}
          onWorksChange={setSelectedWorks}
        />
      </Content>
    </Layout>
  );
};
