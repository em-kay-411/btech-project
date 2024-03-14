import '../css/BusList.css'
import { Snackbar } from '@mui/material';
import { useEffect, useState } from "react";
import mqtt from 'mqtt';
import env from 'react-dotenv';
import axios from 'axios';
import BusDetails from './BusDetails'
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
// console.log(env);
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);

function BusList() {
    const backendURL = env.BACKEND_API_URL;
    const [busCards, setBusCards] = useState([]);
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [detailBus, setDetailBus] = useState('');
    const [route, setRoute] = useState([]);

    const handleClose = (event, reason) => {
        setOpen(false);
    }

    const handleBusCardClick = async (busID) => {
        const requestBody = {
            bus: busID
        }
        const response = await axios.post(`${backendURL}/busRoute`, requestBody);
        const routeArray = response.data.route;
        // console.log(routeArray)
        setRoute(routeArray);
        setDetailBus(busID);
        setDetailsVisible(true);
    }

    const handleDetailsClose = () => {
        setDetailsVisible(false);
    }

    useEffect(() => {
        const handleConnect = () => {
            client.subscribe('universal', () => {
                console.log('subscribed to universal topic');
            })
            console.log('Connected to MQTT broker');
        };

        const handleMessage = (topic, message) => {
            const mqttTopic = topic.split('/')[0];
            // console.log(mqttTopic);
            if (mqttTopic === 'universal') {
                const command = message.toString().split('/')[0];

                if (command === 'connect') {
                    const busID = message.toString().split('/')[1];
                    setBusCards(prevState => {
                        return {
                            ...prevState,
                            [busID]: { latitude: 0, longitude: 0, nextStation: { name: '', latitude: 0, longitude: 0 }, previousStation: { name: '', latitude: '', longitude: '' }, eta: 0 }
                        };
                    });
                    client.subscribe(`location/${busID}`, () => {
                        console.log(`subscribed to bus location from ${busID}`);
                    });
                    setMessage(`Bus ${busID} connected`);
                    setOpen(true);
                }
            }

            if (mqttTopic === 'location') {
                // console.log(mqttTopic);
                const busID = topic.split('/')[1];
                // console.log(busID);
                const data = JSON.parse(message);
                const latitude = data.latitude;
                const longitude = data.longitude;
                const nextStation = data.nextStation;
                const previousStation = data.previousStation;
                const eta = data.eta;
                // console.log(busCards);

                setBusCards(prevState => {
                    return {
                        ...prevState,
                        [busID]: {
                            latitude: latitude,
                            longitude: longitude,
                            nextStation: nextStation,
                            previousStation: previousStation,
                            eta: eta
                        }
                    };
                });
            }
        }

        client.on('connect', handleConnect);
        client.on('message', handleMessage);
    }, [busCards])

    return (
        <div className="bus-list">
            <Snackbar
                open={open}
                autoHideDuration={5000}
                onClose={handleClose}
                message={message}
            />
            {Object.keys(busCards).map((busID) => {
                const { latitude, longitude, nextStation, previousStation, eta } = busCards[busID];
                {/* console.log(latitude, longitude); */}
                return (
                    <>
                        <div className="busCard" onClick={() => { handleBusCardClick(busID) }}>
                            <div className="bus-id">{busID}</div>
                            <div className="station-info">
                                <div className="crossed">Crossed {previousStation.name}</div>
                                <div className="current-location">
                                    Near ({latitude}, {longitude})
                                </div>
                                <div className="next">Arriving at {nextStation.name} in {eta} mins</div>
                            </div>
                            <ChatBubbleIcon className='chat-icon' style={{color:'#c79a46'}}/>                      
                        </div>

                        {detailsVisible && (
                            <div className="bus-details-container">
                            {/* {console.log(busCards[detailBus])} */}
                                <BusDetails
                                    route={route}
                                    busID={detailBus}
                                    latitude={busCards[detailBus].latitude}
                                    longitude={busCards[detailBus].longitude}
                                    nextStation={busCards[detailBus].nextStation}
                                    previousStation={busCards[detailBus].previousStation}
                                    eta={busCards[detailBus].eta}
                                />
                                <CloseIcon className='close-icon' color='#fff' onClick={handleDetailsClose} />
                            </div>
                        )}
                    </>
                )
            })}
        </div>
    )
}

export default BusList;