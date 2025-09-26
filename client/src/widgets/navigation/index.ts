import { lazy } from 'react';

export const Navigation = lazy(() =>
  import('./ui/Navigation').then(module => ({ default: module.Navigation }))
);
export { useNavigation } from './hooks/useNavigation';
