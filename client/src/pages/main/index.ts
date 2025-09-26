import { lazy } from 'react';

export const MainPage = lazy(() =>
  import('./ui/MainPage').then(module => ({ default: module.MainPage }))
);
export { useMainPage } from './hooks/useMainPage';
export type {
  MainPageState,
  MainPageActions,
  MainPageProps,
} from './model/types';
