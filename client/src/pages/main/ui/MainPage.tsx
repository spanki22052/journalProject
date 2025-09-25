import React from 'react';
import { GanntTable } from '@widgets/gannt-table';
import { FiltersModal } from '@features/filters-modal/FiltersModal';
import { useMainPage } from '../hooks/useMainPage';
import styles from './MainPage.module.css';

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
    <div className={styles.layout}>
      <div className={styles.content}>
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
      </div>
    </div>
  );
};
