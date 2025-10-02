import { lazy } from 'react';

export const LoginPage = lazy(() =>
  import('./ui/LoginPage').then(module => ({ default: module.LoginPage }))
);

