import React from 'react';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';

export const withAntd = (component: () => React.ReactNode) => {
  const WrappedComponent = () => (
    <ConfigProvider locale={ruRU}>{component()}</ConfigProvider>
  );
  WrappedComponent.displayName = `withAntd(${component.name || 'Component'})`;
  return WrappedComponent;
};
