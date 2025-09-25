export interface MainPageState {
  selectedOrganization: string | undefined;
  selectedWorks: string[];
  filtersModalVisible: boolean;
}

export interface MainPageActions {
  setSelectedOrganization: (organization: string | undefined) => void;
  setSelectedWorks: (works: string[]) => void;
  handleOpenFilters: () => void;
  handleCloseFilters: () => void;
}

export type MainPageProps = Record<string, never>;
