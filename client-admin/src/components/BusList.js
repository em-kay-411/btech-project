import '../css/BusList.css'
import { Snackbar, Button } from '@mui/material';
import React, { useEffect, useState } from "react";
import mqtt from 'mqtt';
import env from 'react-dotenv';
import axios from 'axios';
import BusDetails from './BusDetails'
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CallIcon from '@mui/icons-material/Call';
import Checkbox from '@mui/material/Checkbox';
import { useBusesToTrack } from './BusesToTrackContext';
import '../css/Map.css';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services'
import Chart from 'chart.js/auto';
// console.log(env);
const brokerURL = env.MQTT_BROKER_URL;
const key = env.MAPS_API_KEY;
const backendURL = env.BACKEND_API_URL;
const client = mqtt.connect(brokerURL);
const sampleRate = 5000;

function BusList({ emergency, setEmergency }) {
    const [socket, setSocket] = useState(null);
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
    const [busIPs, setBusIPs] = useState({ "12345": "192.168.0.101" });  // Just for testing purposes
    const [isMarkingMode, setIsMarkingMode] = useState(false);
    const [dataArray, setDataArray] = useState([]);
    const [audioStream, setAudioStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [onACall, setOnACall] = useState(false);
    const [routes, setRoutes] = useState({});

    useEffect(() => {
        function base64ToUint8Array(base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        }

        const playAudioBlob = (blob) => {
            let audio = new Audio();
            audio.src = URL.createObjectURL(blob);
            try {
                audio.play();
                console.log('playing audio');
            }
            catch {
                console.log('error loading audio');
            }


            // Remove the Blob and revoke URL when audio ends
            audio.onended = function () {
                URL.revokeObjectURL(audio.src);
            };
        }

        if (socket) {
            socket.onmessage = (event) => {
                // console.log(event);
                // const base64text = event.data;
                let reader = new FileReader();

                // Define a function to handle the onload event when the data is successfully read
                reader.onload = function (event) {
                    let dataArrayBuffer = event.target.result;
                    let blob = new Blob([dataArrayBuffer], { type: 'audio/wav' }); // Adjust the type as needed
                    // playAudioBlob(blob);
                    let uint8Array = new Uint8Array(dataArrayBuffer);
                    for (let i = 0; i < uint8Array.length; i++) {
                        // console.log(uint8Array[i]);
                    }

                    const filteredDataArray = uint8Array.filter(value => value !== 0);

                    const newDataArray = [...dataArray, ...filteredDataArray];
                    console.log(newDataArray);
                    setDataArray(newDataArray);

                    // Update chart data
                    const chart = Chart.getChart('myChart');
                    chart.data.labels = Array.from({ length: newDataArray.length }, (_, i) => i);
                    chart.data.datasets[0].data = newDataArray;
                    chart.update();
                };
                reader.readAsArrayBuffer(event.data);
                // console.log(event.data);
                // playPCM(base64text);
            };

            socket.onopen = (event) => {
                console.log('connected to socket');
                console.log(socket);
            }

            socket.onclose = (event) => {
                setDataArray([]);
            }
        }
    }, [socket]);

    useEffect(() => {
        if (socket && onACall) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    console.log('entered in navogatr API')
                    setAudioStream(stream);
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);

                    recorder.ondataavailable = event => {
                        if (socket && socket.readyState === WebSocket.OPEN) {
                            // Send audio data to the WebSocket server
                            console.log('sending', event.data);
                            socket.send(event.data);
                        }
                    };

                    recorder.start();
                })
                .catch(error => {
                    console.error('Microphone permissions not granted', error);
                });



            return () => {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    console.log('entered');
                }
                if (audioStream) {
                    audioStream.getTracks().forEach(track => {
                        track.stop();
                    });
                }
            }
        }

    })

    useEffect(() => {
        const ctx = document.getElementById('myChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Data',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom'
                    },
                    y: {
                        beginAtZero: false,
                        suggestedMin: 50
                    }
                }
            }
        });

        return () => chart.destroy(); // Clean up chart instance
    }, []);

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

    const handleCallClick = (busID) => {
        console.log('before click', onACall)
        if (!onACall) {
            const socketConst = new WebSocket(`ws://${busIPs[busID]}:81`);
            setSocket(socketConst);
            setOnACall(true);

            if (mediaRecorder && mediaRecorder.state === 'inactive') {
                mediaRecorder.start();
                setMediaRecorder(mediaRecorder);
            }
        }
        else {
            setSocket(null);
            setOnACall(false);

            if (mediaRecorder && mediaRecorder.state == 'recording') {
                console.log('stopped it')
                mediaRecorder.stop();
                setMediaRecorder(mediaRecorder);
            }
        }
        console.log('after click', onACall)
    }

    useEffect(() => {
        const storeBusRoute = async (busID) => {
            const requestBody = {
                bus: busID
            }
            const response = await axios.post(`${backendURL}/busRoute`, requestBody);
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
            for (const busID of busesToTrack) {
                if (!routes[busID]) {
                    await storeBusRoute(busID);
                    console.log("storing");
                }
            }
        }

        storeRoutes();
    }, [busesToTrack])

    useEffect(() => {

        const displayRoute = (geo, color) => {
            const routeLayer = map.addLayer({
                id: 'route',
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
            const idx = routes[busID].index;

            if (route) {
                console.log('creating route for', busID);
                const travelledMarkers = [];
                const untravelledMarkers = [];

                let i;
                for (i = 0; i < idx; i++) {
                    console.log(route[i]);
                    const marker = new tt.Marker().setLngLat([route[i].longitude, route[i].latitude]).addTo(map);
                    travelledMarkers.push(marker);
                }

                for (i = idx; i < route.length; i++) {
                    const marker = new tt.Marker().setLngLat([route[i].longitude, route[i].latitude]).addTo(map);
                    untravelledMarkers.push(marker);
                }

                console.log(untravelledMarkers);

                if (travelledMarkers.length) {
                    const locations = travelledMarkers.map(marker => marker.getLngLat());
                    const response = await services.calculateRoute({ key, locations })
                    const geo = response.toGeoJson();
                    displayRoute(geo, "#ffc65f");

                }

                if (untravelledMarkers.length) {
                    const locations = untravelledMarkers.map(marker => marker.getLngLat());
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
        const getConnectedBuses = async () => {
            const response = await axios.get(`${backendURL}/getConnectedBuses`);
            const busesConnected = response.data.busesConnected;
            console.log(busesConnected);

            if (busesConnected) {
                busesConnected.forEach(async (busID) => {
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
                        console.log(`subscribed to busToAdmin/${busID}`);
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
                        console.log(`subscribed to busToAdmin/${busID}`);
                    });
                    // storeBusRoute(busID);
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

                if (command === 'connect-ip') {
                    console.log('entered');
                    const busID = message.toString().split('/')[1];
                    const busIP = message.toString().split('/')[2];

                    setBusIPs(prevState => {
                        return {
                            ...prevState,
                            [busID]: busIP
                        }
                    })
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
                console.log(typeof marker.getLngLat());
                busMarkerReferences[busID].current.style.display = 'block';

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
                const command = message.toString().split('/')[0];

                if (command === 'message') {
                    setMessage(`${busID} sent a message : ${message}`);
                    setOpen(true);
                }

                if (command === 'connect-voice') {
                    console.log("received connect-voice from bus 12345");
                    setMessage(`${busID} has started voice call. Connecting....`);
                    setOpen(true);
                    const busIP = busIPs[busID];
                    console.log(busIPs);

                    // const socketTemp = new WebSocket(`ws://${busIP}:81`);
                    const socketTemp = new WebSocket(`ws://${busIP}:81`);
                    setSocket(socketTemp);
                    setMessage(`Connected to ${busID}`);
                }

                if (command === 'disconnect-voice') {
                    console.log("received disconnect-voice from bus 12345");
                    setDataArray([]);
                    setSocket(null);
                }

                if (command === 'emergency') {
                    const type = message.toString().split('/')[1];
                    if (type === 'fire') {
                        setEmergency(prevState => {
                            return {
                                ...prevState,
                                [busID]: {
                                    typeOfEmergency: 'fire'
                                }
                            }

                        });
                    }

                    if (type === 'accident') {
                        setEmergency(prevState => {
                            return {
                                ...prevState,
                                [busID]: {
                                    typeOfEmergency: 'accident'
                                }
                            }

                        });
                    }

                    if (type === 'FireAndAccident') {
                        setEmergency(prevState => {
                            return {
                                ...prevState,
                                [busID]: {
                                    typeOfEmergency: 'FireAndAccident'
                                }
                            }

                        });
                    }
                }
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
                                <CallIcon className='chat-icon' onClick={(event) => { event.stopPropagation(); handleCallClick(busID) }} style={{ zIndex: 5, color: '#c79a46' }} />
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
            <canvas id="myChart" width="400" height="400"></canvas>
        </>
    )
}

export default BusList;