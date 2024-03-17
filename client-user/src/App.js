import './App.css';
import { useEffect, useRef, useState } from 'react';
import SidePanel from './components/SidePanel';
import Map from './components/Map';

function App() {
  const [mapPosition, setMapPosition] = useState(0);
  const app = useRef(null)

  return (
    <div className="App" ref={app}>
      <SidePanel/>
      <Map />
    </div>
  );
}

export default App;
