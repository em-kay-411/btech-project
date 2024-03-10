import './App.css';
import { useEffect, useRef, useState } from 'react';
import SidePanel from './components/SidePanel';
import Map from './components/Map';
import dotenv from 'dotenv';
dotenv.config({
  resolve : {
    fallback : {
      "crypto" : false
    }
  }
});

function App() {
  const [mapPosition, setMapPosition] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const app = useRef(null);

  const handleDelta = (deltaX) => {
    return
  }

  const handleMouseMove = (event) => {
    // event.preventDefault();
    const deltaX = event.deltaX;
    // console.log(deltaX);
    handleDelta(deltaX);
  }

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const deltaX = touchStartX - touch.pageX;
    console.log(touchStartX);
    console.log(touch.pageX);

    handleDelta(deltaX);
  }

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0].pageX);
  }

  useEffect(() => {
    app.current.addEventListener('wheel', handleMouseMove);
    app.current.addEventListener('touchstart', handleTouchStart);
    app.current.addEventListener('touchmove', handleTouchMove);

    return () => {
      app.current.removeEventListener('wheel', handleMouseMove);
      app.current.removeEventListener('touchstart', handleTouchStart);
      app.current.removeEventListener('touchmove', handleTouchMove);
    }
  })

  return (
    <div className="App" ref={app}>
      <SidePanel/>
      <Map positionX={mapPosition} />
    </div>
  );
}

export default App;
