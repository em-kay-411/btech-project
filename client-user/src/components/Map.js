import '../css/Map.css'
import React, { useEffect, useState, useRef } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import env from 'react-dotenv';
import mqtt from 'mqtt';
import { useBusesToTrack } from './BusesToTrackContext';
import { services } from '@tomtom-international/web-sdk-services';
import axios from 'axios';
const backendURL = env.BACKEND_API_URL;
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
  const { busesToTrack, setBusesToTrack } = useBusesToTrack();
  const [routes, setRoutes] = useState({});
  const [layers, setLayers] = useState([]);

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
    const storeBusRoute = async (busID) => {
      const requestBody = {
        bus: busID
      }
      console.log(requestBody);
      const response = await axios.post(`${backendURL}busRoute`, requestBody);
      console.log(response);
      const routeArray = response.data.route;

      let index;
      for (index = 0; index < routeArray.length; index++) {
        if (!routeArray[index].crossed) {
          break;
        }
      }

      setRoutes(prevState => {
        return {
          ...prevState,
          [busID]: {
            route: routeArray,
            index: index
          }
        }
      })
    }

    const storeRoutes = async () => {
      setRoutes({});
      for(let layer of layers){
        map.removeLayer(layer);
      }
      setLayers([]);
      for (const bus of busesToTrack) {
        if (!routes[bus.id]) {
          await storeBusRoute(bus.id);
          console.log("storing");
        }
      }
    }
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

      storeRoutes();
    }
  }, [busesToTrack]);

  useEffect(() => {

    const displayRoute = (geo, color) => {
      const id = JSON.stringify(geo);
      setLayers([...layers, id]);
      const routeLayer = map.addLayer({
        id: id,
        type: 'line',
        source: {
          type: 'geojson',
          data: geo
        },
        paint: {
          'line-color': color,
          'line-width': 3
        }
      })
    }

    const createRoute = async (busID) => {

      const route = routes[busID].route;

      if (route) {
        console.log('creating route for', busID);
        const markers = [];

        let i;

        for (i = 0; i < route.length; i++) {
          const popup = new tt.Popup({ closeButton: false }).setText(route[i].name);
          const marker = new tt.Marker().setLngLat([route[i].longitude, route[i].latitude]).setPopup(popup).addTo(map);
          markers.push(marker);
        }

        console.log(markers);

        if (markers.length) {
          const locations = markers.map(marker => marker.getLngLat());
          const response = await services.calculateRoute({ key, locations })
          const geo = response.toGeoJson();
          displayRoute(geo, "orange");

        }
      }
    }

    for (const [key] of Object.entries(routes)) {
      console.log('checking', routes);
      if (routes[key]) {
        createRoute(key);
      }
    }

  }, [routes])

  useEffect(() => {
    const handleMessage = (topic, message) => {
      // console.log(subscribedTopics, busMarkerReferences);
      if (subscribedTopics.length > 0 && Object.keys(busMarkerReferences).length > 0) {
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
  },)

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
      <div style={{ display: 'none' }} key={busId} ref={busMarkerReferences[busId]} className='bus-marker'>{busId}</div>
    ))}
  </>
}

export default Map;
