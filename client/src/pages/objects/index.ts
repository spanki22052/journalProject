import { lazy } from 'react';

export const ObjectsPage = lazy(() =>
  import('./ui/ObjectsPage').then(module => ({ default: module.ObjectsPage }))
);
