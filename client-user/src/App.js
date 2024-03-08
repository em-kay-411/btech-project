import './App.css';
import { Autocomplete, TextField, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import allStations from './stations'
import Form from './components/Form';

function App() {
  const [page, setPage] = useState('form');
  const [isVisible, setIsVisible] = useState(true);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const app = useRef(null);

  const handleMouseMove = (event) => {
    event.preventDefault();
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;
    // console.log(deltaX);
    if(Math.abs(deltaX) > Math.abs(deltaY)){
      setPositionX(positionX - (deltaX * 0.08));
    }
    else{
      setPositionY(positionY - (deltaY * 0.08));
    }
  }

  useEffect(() => {
    app.current.addEventListener('wheel', handleMouseMove);

    return () => {
      app.current.removeEventListener('wheel', handleMouseMove);
    }
  })

  return (
    <div className="App" ref={app}>
    <Form visibility={isVisible} positionX={positionX} positionY={positionY}/>

      <div className="map">
        Map place
      </div>

    </div>
  );
}

export default App;
