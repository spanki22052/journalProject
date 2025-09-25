import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export const withRouter = (component: () => React.ReactNode) => {
  const WrappedComponent = () => <BrowserRouter>{component()}</BrowserRouter>;
  WrappedComponent.displayName = `withRouter(${component.name || 'Component'})`;
  return WrappedComponent;
};
