import Spinner from './Spinner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../css/DetailedOptionCard.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import env from 'react-dotenv';
import mqtt from 'mqtt';
import { useBusesToTrack } from './BusesToTrackContext';
const backendURL = env.BACKEND_API_URL;
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);

function DetailedOptionCard(props) {
    // const [props.option, setOption] = useState(props.props.option);
    const [loading, setLoading] = useState(true);
    const [transitDetailsForBus, setTransitDetailsForBus] = useState([]);
    const { busesToTrack, setBusesToTrack } = useBusesToTrack();
    const [cardDetails, setCardDetails] = useState([]);
    const [busInfo, setBusInfo] = useState({});

    // useEffect(() => {
    //     const temp = [];
    //     props.option.forEach(transit => {
    //         console.log(transit);

    //         transit.buses.forEach(bus => {
    //             if (!temp.includes(bus)) {
    //                 temp.push(bus);
    //             }
    //         })
    //     })

    //     setBusesToTrack(temp);
    // }, [])

    const goBack = () => {
        setLoading(true);
        props.setDetailedOptionCard([]);
        setLoading(false);
    }

    useEffect(() => {
        const fetchAllData = async () => {
            if (props.option !== cardDetails) {
                setLoading(true);
                const temp = [];
                const updatedOptions = props.option.map((transit) => {
                    const buses = transit.buses;

                    buses.forEach((bus) => {

                        if (!temp.includes(bus)) {
                            temp.push(bus);
                            client.subscribe(`location/${bus.id}`, () => {
                                console.log('subscribed from detailed option card to ', bus.id);
                            });

                            setBusInfo(prevState => {
                                const newB = {
                                    ...prevState,
                                    [bus.id]: { latitude: 0, longitude: 0, nextStation: '', previousStation: '', eta: 0 }
                                }

                                return newB;
                            })
                        }

                        return {
                            ...bus,
                        }
                    });

                    return {
                        ...transit,
                        buses: buses
                    };
                })

                setBusesToTrack(temp);

                props.setDetailedOptionCard(updatedOptions);
                setCardDetails(updatedOptions);
                setLoading(false);
            }
            // console.log('useeffect in detailed option card');
        }

        fetchAllData();

    }, []);

    useEffect(() => {
        const handleMessage = (topic, message) => {
            const mqttTopic = topic.split('/')[0];
            const busID = topic.split('/')[1];
            if (mqttTopic === 'location') {
                const data = JSON.parse(message);
                const latitude = data.latitude;
                const longitude = data.longitude;
                const location = data.location;
                const nextStation = data.nextStation;
                const previousStation = data.previousStation;
                const eta = data.eta ? data.eta : busInfo[busID].eta;

                setBusInfo(prevState => {
                    return {
                        ...prevState,
                        [busID]: {
                            latitude: latitude,
                            longitude: longitude,
                            location: location,
                            nextStation: nextStation,
                            previousStation: previousStation,
                            eta: eta
                        }
                    }
                })
            }
        }

        client.on('message', handleMessage);

        return () => {
            client.off('message', handleMessage);
        }
    }, [busInfo])

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
            {cardDetails.length > 0 && <div className="detailed-option-card">
                <ArrowBackIcon className="back-button" onClick={goBack} />
                {loading && <Spinner />}
                {!loading && cardDetails.map((transit) => {
                    console.log(transit);
                    const buses = transit.buses;
                    return (
                        <div className="transit-heading">
                            {transit.source} to {transit.destination}
                            <div className="transit-buses">
                                {buses.map((bus) => {
                                    const { latitude, longitude, location, nextStation, previousStation, eta } = busInfo[bus.id];
                                    try {
                                        return (
                                            <div className="bus" key={bus.id} onClick={() => handleTransitDetailsClick(bus)}>
                                                <div className="bus-number-detailed-option-card">{bus.id}</div>
                                                <div className="prev-station-detailed-option-card">{previousStation !== '' && (previousStation == 'Began journey' ? `Began journey` : `Crossed ${previousStation}`)}</div>
                                                <div className="current-location-detailed-option-card">
                                                    {location && `At ${location}`}
                                                </div>
                                                <div className="next-station-detailed-option-card">{nextStation && `Arriving at ${nextStation}`} {eta && `in ${eta}`}</div>
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

            {transitDetailsForBus.length > 1 && <div className="transit-details-for-bus">
                Nothing
            </div>}
        </>
    );

}

export default DetailedOptionCard;