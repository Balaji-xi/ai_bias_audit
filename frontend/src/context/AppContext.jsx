import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [dataset, setDataset] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [biasMetrics, setBiasMetrics] = useState(null);
  const [mitigatedMetrics, setMitigatedMetrics] = useState(null);

  return (
    <AppContext.Provider value={{
      dataset, setDataset,
      modelData, setModelData,
      biasMetrics, setBiasMetrics,
      mitigatedMetrics, setMitigatedMetrics
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
