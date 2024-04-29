import '../css/BusList.css'
import { Snackbar, Button } from '@mui/material';
import React, { useEffect, useState } from "react";
import mqtt from 'mqtt';
import env from 'react-dotenv';
import axios from 'axios';
import BusDetails from './BusDetails'
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Checkbox from '@mui/material/Checkbox';
import { useBusesToTrack } from './BusesToTrackContext';
import '../css/Map.css';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
// console.log(env);
const brokerURL = env.MQTT_BROKER_URL;
const key = env.MAPS_API_KEY;
const backendURL = env.BACKEND_API_URL;
const client = mqtt.connect(brokerURL);

function BusList() {
    const [map, setMap] = useState(null);
    const [busCards, setBusCards] = useState({});
    const { busesToTrack, setBusesToTrack } = useBusesToTrack();
    const [busMarkerReferences, setBusMarkerReferences] = useState({});
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [detailBus, setDetailBus] = useState('');
    const [route, setRoute] = useState([]);
    const [checkedBuses, setCheckedBus] = useState({});
    const [messageSingleBus, setMessageSingleBus] = useState('');
    const [textMessage, setTextMessage] = useState('');
    const [messageBoxOpen, setMessageBoxOpen] = useState(false);
    const [isMarkingMode, setIsMarkingMode] = useState(false);

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

    const clickAnywhere = () => {
        setMessageBoxOpen(false);
        setTextMessage('');
        setCheckedBus([]);
        setMessageSingleBus(false);
    }

    const handleDetailsClose = () => {
        setDetailsVisible(false);
    }

    const handleChatClick = (busID) => {
        uncheckAllBuses();
        setMessageSingleBus(busID);
        setMessageBoxOpen(true);
    }

    const handleChatMasterClick = () => {
        setMessageBoxOpen(true);
    }

    const handleCheckboxMasterClick = (checked) => {
        if (checked) {
            checkAllBuses();
        }
        else {
            uncheckAllBuses();
        }
    }

    const handleSendMessage = () => {
        if (messageSingleBus !== '') {
            console.log('sending message');
            client.publish(`adminToBus/${messageSingleBus}`, textMessage);
        }
        else {
            for (const [checkedBusKey, checkedBusValue] of Object.entries(checkedBuses)) {
                if (checkedBusValue) {
                    console.log(checkedBusKey);
                    client.publish(`adminToBus/${checkedBusKey}`, textMessage);
                }
            }
        }
        setMessageBoxOpen(false);
        setMessageSingleBus('');
        setTextMessage('');
    }

    const handleMessageBoxClose = () => {
        setMessageBoxOpen(false);
        setMessageSingleBus('');
        setTextMessage('');
    }

    const handleTextMessageChange = (event) => {
        setTextMessage(event.target.value);
    }

    const handleCheckboxClick = async (busID) => {
        setCheckedBus(prevState => ({
            ...prevState,
            [busID]: !prevState[busID]
        }));
        console.log(checkedBuses)
    }

    const addCardToCheckedMap = (busID) => {
        setCheckedBus(prevState => ({
            ...prevState,
            [busID]: false
        }));
    }

    const checkAllBuses = () => {
        setCheckedBus(prevState => {
            const temp = { ...prevState };

            Object.keys(temp).forEach(key => {
                temp[key] = true;
            });
            console.log('temp', temp);
            return temp;
        })
    }

    const uncheckAllBuses = () => {
        setCheckedBus(prevState => {
            const temp = { ...prevState };

            Object.keys(temp).forEach(key => {
                temp[key] = false;
            });
            console.log('temp', temp);
            return temp;
        })
    }

    useEffect(() => {
        const getConnectedBuses = async () => {
            const response = await axios.get(`${backendURL}/getConnectedBuses`);
            const busesConnected = response.data.busesConnected;
            console.log(busesConnected);

            if (busesConnected) {
                busesConnected.forEach(busID => {
                    setBusesToTrack(prevState => ([...prevState, busID]));
                    setBusCards(prevState => {
                        const newB = {
                            ...prevState,
                            [busID]: { latitude: 0, longitude: 0, nextStation: '', previousStation: '', eta: 0 }
                        };
                        console.log(newB);
                        return newB;
                    });
                    addCardToCheckedMap(busID);
                    client.subscribe(`location/${busID}`, () => {
                        console.log(`subscribed to bus location from ${busID}`);
                    });
                    client.subscribe(`busToAdmin/${busID}`, () => {
                        console.log(`subscribed to adminToBus/${busID}`);
                    });
                    const busMarkerRef = React.createRef();
                    setBusMarkerReferences(prevState => {
                        return {
                            ...prevState,
                            [busID]: busMarkerRef
                        }
                    })
                    setMessage(`Bus ${busID} connected`);
                    setOpen(true);
                })
            }
        }

        getConnectedBuses();

    }, [])

    useEffect(() => {
        const handleConnect = () => {
            client.subscribe('universal', () => {
                console.log('subscribed to universal topic');
            });
            console.log('Connected to MQTT broker');
        };

        const handleMessage = (topic, message) => {
            const mqttTopic = topic.split('/')[0];
            // console.log(mqttTopic);
            if (mqttTopic === 'universal') {
                const command = message.toString().split('/')[0];

                if (command === 'connect') {
                    const busID = message.toString().split('/')[1];
                    setBusesToTrack(prevState => ([...prevState, busID]));
                    setBusCards(prevState => {
                        const newB = {
                            ...prevState,
                            [busID]: { latitude: 0, longitude: 0, nextStation: '', previousStation: '', eta: 0 }
                        };
                        console.log(newB);
                        return newB;
                    });
                    addCardToCheckedMap(busID);
                    client.subscribe(`location/${busID}`, () => {
                        console.log(`subscribed to bus location from ${busID}`);
                    });
                    client.subscribe(`busToAdmin/${busID}`, () => {
                        console.log(`subscribed to adminToBus/${busID}`);
                    });
                    const busMarkerRef = React.createRef();
                    setBusMarkerReferences(prevState => {
                        return {
                            ...prevState,
                            [busID]: busMarkerRef
                        }
                    })
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
                const location = data.location;
                const nextStation = data.nextStation;
                const previousStation = data.previousStation;
                const eta = data.eta ? data.eta : busCards[busID].eta;
                // console.log(data);
                // console.log(busCards);
                const marker = new tt.Marker({ element: busMarkerReferences[busID].current }).setLngLat([longitude, latitude]).addTo(map);
                busMarkerReferences[busID].current.style.display = 'block';
                console.log(busMarkerReferences);

                setBusCards(prevState => {
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
                    };
                });
            }

            if (mqttTopic === 'busToAdmin') {
                const busID = topic.split('/')[1];
                setMessage(`${busID} sent a message`);
                setOpen(true);
            }
        }

        // document.body.addEventListener('click', clickAnywhere);
        client.on('connect', handleConnect);
        client.on('message', handleMessage);

        return () => {
            client.off('connect', handleConnect);
            client.off('message', handleMessage);
            document.body.removeEventListener('click', clickAnywhere);
        }
    }, [busCards])

    useEffect(() => {
        if (!map) {
            const mapInstance = tt.map({
                key: key,
                container: 'map',
                center: [73.8567, 18.5204],
                zoom: 12,
            });

            setMap(mapInstance);
        }
    }, [map]);

    return (
        <>
            <div className='map-area' id="map"></div>
            {Object.keys(busMarkerReferences).length > 0 && Object.keys(busMarkerReferences).map(busId => (
                <div style={{ display: 'none' }} key={busId} ref={busMarkerReferences[busId]} className='bus-marker'>{busId}</div>
            ))}
            <div className="bus-list">
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={handleClose}
                    message={message}
                />
                {Object.keys(busCards).length > 1 && <>
                    <Checkbox className='check-box-master' aria-label='Checkbox demo' onClick={(event) => { event.stopPropagation(); handleCheckboxMasterClick(event.target.checked) }} />
                    <ChatBubbleIcon className='chat-icon-master' onClick={(event) => { event.stopPropagation(); handleChatMasterClick() }} style={{ zIndex: 5, color: '#c79a46' }} />
                </>}
                {Object.keys(busCards).map((busID) => {
                    const { latitude, longitude, location, nextStation, previousStation, eta } = busCards[busID];
                    {/* console.log(latitude, longitude); */ }
                    return (
                        <>
                            <div className="busCard" onClick={() => { handleBusCardClick(busID) }}>
                                <Checkbox aria-label='Checkbox demo' checked={checkedBuses[busID]} onClick={(event) => { event.stopPropagation(); handleCheckboxClick(busID) }} />
                                <div className="bus-id">{busID}</div>
                                <div className="station-info">
                                    <div className="crossed">{previousStation !== '' && (previousStation == 'Began journey' ? `Began journey` : `Crossed ${previousStation}`)}</div>
                                    <div className="current-location">
                                        {location && `At ${location}`}
                                    </div>
                                    <div className="next">{nextStation && `Arriving at ${nextStation}`} {eta && `in ${eta} mins`}</div>
                                </div>
                                <ChatBubbleIcon className='chat-icon' onClick={(event) => { event.stopPropagation(); handleChatClick(busID) }} style={{ zIndex: 5, color: '#c79a46' }} />
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

                {((Object.keys(checkedBuses).length >= 1 || messageSingleBus !== '') && messageBoxOpen) && (<div className='message-box'>
                    <CloseIcon className='message-box-close-icon' color='#fff' onClick={handleMessageBoxClose} />
                    <textarea className="text-area" cols="30" rows="3" placeholder='enter message' onChange={handleTextMessageChange}></textarea>
                    {/* <TextareaAutosize aria-label="minimum height" minRows={3} placeholder="Enter Message" onChange={handleTextMessageChange} /> */}
                    <Button id='sendButton' onClick={handleSendMessage}>Send</Button>
                </div>)}
            </div>
        </>
    )
}

export default BusList;