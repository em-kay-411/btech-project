import '../css/Map.css'
import React, { useEffect, useState, useRef } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import env from 'react-dotenv';
import mqtt from 'mqtt';
import { useBusesToTrack } from './BusesToTrackContext';
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);
const key = env.MAPS_API_KEY;

function Map() {
  const [map, setMap] = useState(null);
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const [userLocation, setUserLocation] = useState(0);
  const [userLocationMarker, setUserLocationMarker] = useState(null);
  const userLocationElement = useRef(null);
  const [busMarkerReferences, setBusMarkerReferences] = useState({});
  const {busesToTrack, setBusesToTrack} = useBusesToTrack();

  const handleRecenterMap = () => {
    map.setCenter([userLocation.longitude, userLocation.latitude]);
  }

  const unsubscribeToAllTopics = () => {
    subscribedTopics.forEach((topic) => {
      client.unsubscribe(topic);
      console.log('unsubscribed from', topic);
    })
    setSubscribedTopics([]);
  }

  useEffect(() => {
    const updateUserPosition = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setUserLocation({ latitude, longitude });
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
    if (!map && userLocation) {
      const mapInstance = tt.map({
        key: key,
        container: 'map',
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 17,
      });

      setMap(mapInstance);
    }

    if (map && userLocation) {
      // console.log(userLocationElement);
      const marker = new tt.Marker({ element: userLocationElement.current }).setLngLat([userLocation.longitude, userLocation.latitude]).addTo(map);
      setUserLocationMarker(marker);
    }
  }, [map, userLocation]);

  useEffect(() => {    
    if (busesToTrack) {
      unsubscribeToAllTopics();
      const tempSubscribedTopics = [];
      const tempMarkerReferences = {};
      busesToTrack.forEach((bus) => {
        tempMarkerReferences[bus.id] = React.createRef();
        client.subscribe(`location/${bus.id}`, () => {
          tempSubscribedTopics.push(`location/${bus.id}`);
          console.log(`subscribed to bus location from ${bus.id}`);          
        });
        // console.log(tempMarkerReferences);
        setBusMarkerReferences(tempMarkerReferences);
        setSubscribedTopics(tempSubscribedTopics);

        // console.log(subscribedTopics);
        // console.log(busMarkerReferences);
        // console.log(busesToTrack);
      })      
    }    
  }, [busesToTrack]);

  useEffect(() => {
    const handleMessage = (topic, message) => {
      // console.log(subscribedTopics, busMarkerReferences);
      if(subscribedTopics.length > 0 && Object.keys(busMarkerReferences).length > 0){
        const bus = topic.split('/')[1];
        const location = JSON.parse(message);
        // console.log(busMarkerReferences[bus].current);        
        const marker = new tt.Marker({ element: busMarkerReferences[bus].current }).setLngLat([location.longitude, location.latitude]).addTo(map);
        busMarkerReferences[bus].current.style.display = 'block';
        // console.log(busMarkerReferences[bus].current)        
      }          
    }

    client.on('message', handleMessage);

    return () => {
      client.off('message', handleMessage);
    }
  }, )

  return <>
    <div className='map-area' id="map" />;
    <div className="recenter" onClick={handleRecenterMap}>
      RECENTER
    </div>
    <div
      ref={userLocationElement}
      id="user-location"
    ></div>
    {Object.keys(busMarkerReferences).length > 0 && Object.keys(busMarkerReferences).map(busId => (
      <div style={{display:'none'}} key={busId} ref={busMarkerReferences[busId]} className='bus-marker'>{busId}</div>
    ))}
  </>
}

export default Map;
