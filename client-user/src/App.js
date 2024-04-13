import './App.css';
import { useEffect, useRef, useState, useContext, createContext } from 'react';
import SidePanel from './components/SidePanel';
import Map from './components/Map';
import { BusesProvider } from './components/BusesToTrackContext';

function App() {
  const [mapPosition, setMapPosition] = useState(0);
  const app = useRef(null)

  return (
    <BusesProvider>
      <div className="App" ref={app}>
        <SidePanel/>
        <Map busesToTrack={[]} />
      </div>
    </BusesProvider>    
  );
}

export default App;
