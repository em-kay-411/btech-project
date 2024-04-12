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
    map.setCenter([userLocation.longitude, userLocation.latitude]);
  } 

  useEffect(() => {
    const updateUserPosition = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setUserLocation({latitude, longitude});
    }

    const error = (err) => {
      console.log(err.code, err.message);
    }

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(updateUserPosition, error, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }   
  }, []);

  useEffect(() => {   
    if(!map && userLocation){
      const mapInstance = tt.map({
        key: key,
        container: 'map',
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 17,
      }); 
      
      setMap(mapInstance);
    } 

    if(map && userLocation){
      console.log(userLocation);
      const marker = new tt.Marker({element : userLocationElement.current}).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
      setUserLocationMarker(marker);
    } 
  }, [map, userLocation])

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
