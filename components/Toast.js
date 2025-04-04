import React, { useContext, useEffect } from 'react';
import { ShowToastContext } from '../context/ShowToastContext';

function Toast() {
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);

  useEffect(() => {
    if (showToastMsg) {
      const timer = setTimeout(() => {
        setShowToastMsg(null);
      }, 3000);

      return () => clearTimeout(timer); // Cleanup the timer on unmount
    }
  }, [showToastMsg, setShowToastMsg]);

  if (!showToastMsg) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg">
        <span>{showToastMsg}</span>
      </div>
    </div>
  );
}

export default Toast;