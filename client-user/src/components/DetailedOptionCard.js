import Spinner from './Spinner';
import '../css/DetailedOptionCard.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import env from 'react-dotenv';
const backendURL = env.BACKEND_API_URL;

function DetailedOptionCard(props) {
    const [option, setOption] = useState(props.option);
    const [loading, setLoading] = useState(true);
    const [transitDetailsForBus, setTransitDetailsForBus] = useState([]);

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

            if(i >= routeArray.length){
                return 'journey end';
            }

            const stationID = routeArray[i].station;
            const requestBody = {
                stationID: stationID
            }

            const response = await axios.post(`${backendURL}stationNameFromID`, requestBody);
            return response.data.stationName;
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
            const updatedOptions = await Promise.all(option.map(async (transit) => {
                const buses = transit.buses;
    
                const updatedBuses = await Promise.all(buses.map(async (bus) => {
                    const prevStation = await getPrevStation(bus);
                    const nextStation = await getNextStation(bus);
    
                    return {
                        ...bus, 
                        prevStation : prevStation,
                        nextStation : nextStation
                    }
                }));
    
                return {
                    ...transit,
                    buses: updatedBuses
                };
            }))

            setOption(updatedOptions);
            setLoading(false);
        }        

        fetchAllData();
        console.log('useeffect', option);
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

    return(
        <>
            <div className="detailed-option-card">
                {loading && <Spinner/>}
                {!loading && option.map((transit) => {
                    console.log(transit);
                    const buses = transit.buses;
                    console.log(buses);
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
            </div>
            {transitDetailsForBus.length > 1 && <div className="transit-details-for-bus">
                Nothing
            </div>}
        </>
    );

}

export default DetailedOptionCard;