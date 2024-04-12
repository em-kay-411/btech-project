import '../css/Map.css'
import React, { useEffect, useState, useRef } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import env from 'react-dotenv';
const key = env.MAPS_API_KEY

function Map() {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationMarker, setUserLocationMarker] = useState(null);
  const userLocationElement = useRef(null);

  const handleRecenterMap = () => {
    const map = tt.map({
      key: key,
      container: 'map',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 17,
    });  

    const marker = new tt.Marker({element : userLocationElement.current}).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
    setUserLocationMarker(userLocationMarker)
  } 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        error => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }   
  }, []);

  useEffect(() => {    
    if(userLocation){
      const map = tt.map({
        key: key,
        container: 'map',
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 17,
      });  

      const marker = new tt.Marker({element : userLocationElement.current}).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
      setUserLocationMarker(userLocationMarker)
  
      return () => {
        map.remove();
      };
    } 
  }, [userLocation])

  return <>
    <div className='map-area' id="map"/>;
    <div className="recenter" onClick={handleRecenterMap}>
      RECENTER
    </div>
    <div
        ref={userLocationElement}
        id="user-location"
    ></div>
  </> 
}

export default Map;
