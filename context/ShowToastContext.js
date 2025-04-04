import { createContext, useState } from 'react';

const defaultContext = {
  showToastMsg: '',
  setShowToastMsg: () => null,
  showFavorites: false,
  setShowFavorites: () => null
};

export const ShowToastContext = createContext(defaultContext);

export function ShowToastProvider({ children }) {
  const [showToastMsg, setShowToastMsg] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const contextValue = {
    showToastMsg,
    setShowToastMsg,
    showFavorites,
    setShowFavorites
  };

  return (
    <ShowToastContext.Provider value={contextValue}>
      {children}
    </ShowToastContext.Provider>
  );
}