import '../css/DetailedOptionCard.css'
import { useState } from 'react';
import axios from 'axios';
import env from 'react-dotenv';

function DetailedOptionCard (props) {
    const option = props.option;
    const backendURL = env.BACKEND_API_URL;
    const [transitDetailsForBus, setTransitDetailsForBus] = useState([]);

    const getNextStation = async (bus) => {
        const routeArray = bus.route;

        let i = 0;
        while (i < routeArray.length) {
            if (!routeArray[i].crossed) {
                break;
            }
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
        return response.data.stationName;
    }

    const handleTransitDetailsClick = async (bus) => {
        const stationNames = bus.route.map(async (station) => {
            const requestBody = {
                stationID: station
            }
            const response = await axios.post(`${backendURL}stationNameFromID`, requestBody);
            return response.data.stationName;
        })

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
        console.log(transitDetailsForBus);
    }

    return (
        <>
            <div className="detailed-option-card">
                {option.map((transit) => {
                    return (
                        <div className="transit-heading" key={`${transit.source}-${transit.destination}`}>
                            {transit.source} to {transit.destination}
                            <div className="transit-buses">
                                {transit.buses.map((bus) => {
                                    const prevStationPromise = getPrevStation(bus);
                                    const nextStationPromise = getNextStation(bus);
    
                                    return(
                                        <div className="bus" key={bus.id} onClick={() => handleTransitDetailsClick(bus)}>
                                            <div className="bus-number-detailed-option-card">{bus.id}</div>
                                            <div className="prev-station-detailed-option-card">Crossed {prevStationPromise}</div>
                                            <div className="next-station-detailed-option-card">Arriving at {nextStationPromise} in (Calculate ETA)</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {transitDetailsForBus.length > 1 && <div className="transit-details-for-bus">
    
            </div>}
        </>
    );
    
}

export default DetailedOptionCard;