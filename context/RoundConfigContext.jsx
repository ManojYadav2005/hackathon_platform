
"use client";
import React, { useState, useEffect, useContext, createContext } from 'react';
import { db, doc, onSnapshot, getRoundConfigDocPath } from '../app/firebase/config';
import { LoadingPage } from '../components/common/Loader.jsx';

const RoundConfigContext = createContext(null);

export const useRoundConfig = () => useContext(RoundConfigContext);

export const RoundConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const configDocRef = doc(db, getRoundConfigDocPath());
    const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        setConfig({});
      }
      setLoading(false);
    }, (e) => {
      console.error("Error fetching round config:", e);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <RoundConfigContext.Provider value={config}>
      {children}
    </RoundConfigContext.Provider>
  );
};
