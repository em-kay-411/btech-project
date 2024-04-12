import Spinner from './Spinner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../css/DetailedOptionCard.css'
import { useState, useEffect } from 'react';
import Map from './Map';
import axios from 'axios';
import env from 'react-dotenv';
import mqtt from 'mqtt';
const backendURL = env.BACKEND_API_URL;
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);

function DetailedOptionCard(props) {
    // const [props.option, setOption] = useState(props.props.option);
    const [loading, setLoading] = useState(true);
    const [transitDetailsForBus, setTransitDetailsForBus] = useState([]);
    const [busesToTrack, setBusesToTrack] = useState([]);

    useEffect(() => {
        const temp = [];
        props.option.forEach(transit => {
            console.log(transit);

            transit.buses.forEach(bus => {
                if(!temp.includes(bus)){
                    temp.push(bus);
                }
            })
        })

        setBusesToTrack(temp);
    }, [props.option])

    const goBack = () => {
        setLoading(true);
        props.setDetailedOptionCard([]);
        setLoading(false);
    }

    useEffect(() => {
        const getNextStation = async (bus) => {
            const routeArray = bus.route;

            let i = 0;
            while (i < routeArray.length) {
                if (!routeArray[i].crossed) {
                    break;
                }
                i++;
            }

            if (i >= routeArray.length) {
                return 'journey end';
            }

            const stationID = routeArray[i].station;
            const requestBody = {
                stationID: stationID
            }

            const response = await axios.post(`${backendURL}stationNameFromID`, requestBody);
            return response.data.stationName;
        }

        const getNextStationPosition = async (bus) => {
            const routeArray = bus.route;

            let i = 0;
            while (i < routeArray.length) {
                if (!routeArray[i].crossed) {
                    break;
                }
                i++;
            }

            if (i >= routeArray.length) {
                return 'journey end';
            }

            const stationID = routeArray[i].station;
            const requestBody = {
                stationID: stationID
            }

            const response = await axios.post(`${backendURL}stationPosition`, requestBody);
            return response.data.position;
        }

        const getPrevStation = async (bus) => {
            const routeArray = bus.route;

            let i = 0;
            while (i < routeArray.length) {
                if (!routeArray[i].crossed) {
                    break;
                }
                i++;
            }

            i--;
            if (i < 0) {
                return 'began';
            }
            const stationID = routeArray[i].station;
            const requestBody = {
                stationID: stationID
            }

            const response = await axios.post(`${backendURL}stationNameFromID`, requestBody);
            // console.log(response.data.stationName);
            return response.data.stationName;
        }

        const fetchAllData = async () => {
            setLoading(true);
            const updatedOptions = await Promise.all(props.option.map(async (transit) => {
                const buses = transit.buses;

                const updatedBuses = await Promise.all(buses.map(async (bus) => {
                    const prevStation = await getPrevStation(bus);
                    const nextStation = await getNextStation(bus);
                    const nextStationPosition = await getNextStationPosition(bus);

                    return {
                        ...bus,
                        prevStation: prevStation,
                        nextStation: nextStation,
                        nextStationLatitude: nextStationPosition.latitude,
                        nexStationLongitude: nextStationPosition.longitude
                    }
                }));

                return {
                    ...transit,
                    buses: updatedBuses
                };
            }))

            props.setDetailedOptionCard(updatedOptions);
            setLoading(false);
        }

        fetchAllData();
        console.log('useeffect', props.option);
    }, [])

    const handleTransitDetailsClick = async (bus) => {
        const stationPromises = bus.route.map(async (station) => {
            const requestBody = {
                stationID: station
            };
            const response = await axios.post(`${backendURL}stationNameFromID`, requestBody);
            return response.data.stationName;
        });

        const stationNames = await Promise.all(stationPromises);

        let i = 0;
        while (stationNames[i] !== bus.source) {
            i++;
        }

        const ans = [];
        while (stationNames[i] !== bus.destination) {
            ans[stationNames[i]] = bus.route[i].crossed;
            i++;
        }

        if (i < stationNames.length) {
            ans[stationNames[i]] = bus.route[i].crossed;
        }
        setTransitDetailsForBus(ans);
    }

    return (
        <>
            {props.option.length > 0 && <div className="detailed-option-card">
                <ArrowBackIcon className="back-button" onClick={goBack} />
                {loading && <Spinner />}
                {!loading && props.option.map((transit) => {
                    console.log(transit);
                    const buses = transit.buses;
                    return (
                        <div className="transit-heading">
                            {transit.source} to {transit.destination}
                            <div className="transit-buses">
                                {buses.map((bus) => {
                                    try {
                                        return (
                                            <div className="bus" key={bus.id} onClick={() => handleTransitDetailsClick(bus)}>
                                                <div className="bus-number-detailed-option-card">{bus.id}</div>
                                                <div className="prev-station-detailed-option-card">{bus.prevStation === 'began' ? ('Began journey') : (`Crossed ${bus.prevStation}`)}</div>
                                                <div className="next-station-detailed-option-card">Arriving at {bus.nextStation === 'journey end' ? ('end of the jounrey') : bus.nextStation} in (Calculate ETA)</div>
                                            </div>
                                        );
                                    } catch (err) {
                                        return null;
                                    }

                                })}
                            </div>
                        </div>
                    );
                })}
            </div>}

            <Map busesToTrack={busesToTrack} ></Map>

            {transitDetailsForBus.length > 1 && <div className="transit-details-for-bus">
                Nothing
            </div>}
        </>
    );

}

export default DetailedOptionCard;