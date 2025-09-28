import React from 'react';

interface PTSDataContextType {
  currentPTS: number;
  setCurrentPTS: React.Dispatch<React.SetStateAction<number>>;
  targetPTS: number;
  setTargetPTS: React.Dispatch<React.SetStateAction<number>>;
  gameDays: any[];
  setGameDays: React.Dispatch<React.SetStateAction<any[]>>;
  currentDay: any;
  setCurrentDay: React.Dispatch<React.SetStateAction<any>>;
}

const PTSDataContext = React.createContext<PTSDataContextType | undefined>(undefined);

export { PTSDataContext };