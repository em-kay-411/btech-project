import '../css/Map.css';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import { useEffect, useState } from 'react';
import env from 'react-dotenv';
import { useBusesToTrack } from './BusesToTrackContext';
const key = env.MAPS_API_KEY;

function Map() {
    const [map, setMap] = useState(null);
    const { busesToTrack, setBusesToTrack } = useBusesToTrack();

    useEffect(() => {
        if (!map) {
            const mapInstance = tt.map({
                key: key,
                container: 'map',
                center: [73.8567, 18.5204],
                zoom: 15,
            });

            setMap(mapInstance);
        }
    }, [map]);

    return (
        <div className='map-area' id="map"></div>
    )
}

export default Map;