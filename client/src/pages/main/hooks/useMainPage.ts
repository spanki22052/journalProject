import { useState } from 'react';
import { MainPageState, MainPageActions } from '../model/types';

export const useMainPage = (): MainPageState & MainPageActions => {
  const [selectedOrganization, setSelectedOrganization] = useState<
    string | undefined
  >(undefined);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);

  const handleOpenFilters = () => {
    setFiltersModalVisible(true);
  };

  const handleCloseFilters = () => {
    setFiltersModalVisible(false);
  };

  return {
    // State
    selectedOrganization,
    selectedWorks,
    filtersModalVisible,
    // Actions
    setSelectedOrganization,
    setSelectedWorks,
    handleOpenFilters,
    handleCloseFilters,
  };
};
