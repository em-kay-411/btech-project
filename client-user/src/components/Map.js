import '../css/Map.css'
import React, { useEffect, useState, useRef } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import env from 'react-dotenv';
import mqtt from 'mqtt';
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);
const key = env.MAPS_API_KEY;

function Map(props) {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationMarker, setUserLocationMarker] = useState(null);
  const userLocationElement = useRef(null);
  const busMarkerReferences = useRef({});

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
        zoom: 15,
      }); 
      
      setMap(mapInstance);
    } 

    if(map && userLocation){
      console.log(userLocation);
      const marker = new tt.Marker({element : userLocationElement.current}).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
      setUserLocationMarker(marker);
    } 
  }, [map, userLocation]);

  useEffect(() => {
    if(props.busesToTrack){
      console.log('props', props.busesToTrack);
      props.busesToTrack.forEach(bus => {
        busMarkerReferences[bus.id] = React.createRef();
        client.subscribe(`location/${bus.id}`, () => {
            console.log(`subscribed to bus location from ${bus.id}`);
        });
      })
    }    
  }, [props.busesToTrack]);

  useEffect(() => {
    const handleMessage = (topic, message) => {
        const bus = topic.split('/')[1];
        const location = JSON.parse(message);

        new tt.Marker({element : busMarkerReferences.current[bus]}).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
    }

    client.on('message', handleMessage);

    return () => {
        client.off('message', handleMessage);
    }
})

  return <>
    <div className='map-area' id="map"/>;
    <div className="recenter" onClick={handleRecenterMap}>
      RECENTER
    </div>
    <div
        ref={userLocationElement}
        id="user-location"
    ></div>
    {Object.keys(busMarkerReferences.current).map(busId => (
      <div key={busId} ref={busMarkerReferences.current[busId]} className='bus-marker'></div>
    ))}
  </> 
}

export default Map;
