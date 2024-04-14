import {useState, useContext, createContext } from 'react';
const BusesToTrack = createContext();

export const BusesProvider = ({ children }) => {
  const [busesToTrack, setBusesToTrack] = useState([]);

  return (
    <BusesToTrack.Provider value={{ busesToTrack, setBusesToTrack }}>
      {children}
    </BusesToTrack.Provider>
  );
};

export const useBusesToTrack = () => useContext(BusesToTrack);