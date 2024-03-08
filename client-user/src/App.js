import './App.css';
import { useEffect, useRef, useState } from 'react';
import Form from './components/Form';
import Map from './components/Map';

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(true);
  const [formPosition, setFormPosition] = useState(0);
  const [mapPosition, setMapPosition] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const app = useRef(null);

  const handleDelta = (deltaX) => {
    if (swipeDirection && deltaX > 0) {
      setFormPosition(formPosition - (deltaX * 0.08));

      if (Math.abs(formPosition) > 5) {
        setIsVisible(false);
        setTimeout(() => {
          setSwipeDirection(false);
        }, 1000)
      }
      else {
        setTimeout(() => {
          setFormPosition(0);
        }, 1000)
      }
    }

    if (!swipeDirection && deltaX < 0) {
      setMapPosition(mapPosition - (deltaX * 0.08));

      if (Math.abs(mapPosition) > 5) {
        setIsVisible(true);
        setTimeout(() => {
          setSwipeDirection(true);
        }, 1000)
      }
      else {
        setTimeout(() => {
          setMapPosition(0);
        }, 1000)
      }
    }
  }

  const handleMouseMove = (event) => {
    event.preventDefault();
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
      <Form visibility={isVisible} positionX={formPosition} />
      <Map visibility={!isVisible} positionX={mapPosition} />
    </div>
  );
}

export default App;
