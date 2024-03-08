import './App.css';
import { useEffect, useRef, useState } from 'react';
import Form from './components/Form';
import Map from './components/Map';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(true);
  const [formPosition, setFormPosition] = useState(0);
  const [mapPosition, setMapPosition] = useState(0);
  const app = useRef(null);

  const handleMouseMove = (event) => {
    event.preventDefault();
    const deltaX = event.deltaX;
    // console.log(deltaX);

    if(swipeDirection && deltaX > 0){
      setFormPosition(formPosition - (deltaX * 0.08));
      
      if(Math.abs(formPosition) > 5){
        setIsVisible(false);
        setTimeout(() => {
          setSwipeDirection(false);
        }, 1000)
      }
      else{
        setTimeout(() => {
          setFormPosition(0);          
        }, 1000)
      }
    }
    
    if(!swipeDirection && deltaX < 0){
      setMapPosition(mapPosition - (deltaX * 0.08));

      if(Math.abs(mapPosition) > 5){
        setIsVisible(true);
        setTimeout(() => {
          setSwipeDirection(true);
        }, 1000)
      }
      else{
        setTimeout(() => {
          setMapPosition(0);          
        }, 1000)
      }
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
      <Form visibility={isVisible} positionX={formPosition}/>
      <Map visibility={!isVisible} positionX={mapPosition}/>
    </div>
  );
}

export default App;
