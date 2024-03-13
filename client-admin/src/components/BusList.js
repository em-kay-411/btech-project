import '../css/BusList.css'
import { useEffect, useState } from "react";
import mqtt from 'mqtt';
import env from 'react-dotenv';
// console.log(env);
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);

function BusList() {
    const [busCards, setBusCards] = useState([]);

    useEffect(() => {
        const handleConnect = () => {
            client.subscribe('universal', () => {
                console.log('subscribed to universal topic');
            })
            console.log('Connected to MQTT broker');
        };

        const handleMessage = (topic, message) => {
            const mqttTopic = topic.split('/')[0];
            console.log(mqttTopic);
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
                }
            }

            if (mqttTopic === 'location') {
                console.log(mqttTopic);
                const busID = topic.split('/')[1];
                console.log(busID);
                const data = JSON.parse(message);
                const latitude = data.latitude;
                const longitude = data.longitude;
                const nextStation = data.nextStation;
                const previousStation = data.previousStation;
                const eta = data.eta;
                console.log(busCards);

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
            {Object.keys(busCards).map((busID) => {
                const { latitude, longitude, nextStation, previousStation, eta } = busCards[busID];
                return (
                    <div key={busID} className="busCard">
                        <div className="bus-id">{busID}</div>
                        <div className="station-info">
                            <div className="crossed">Crossed {previousStation.name}</div>
                            <div className="current-location">
                                Near ({latitude}, {longitude})
                            </div>
                            <div className="next">Arriving at {nextStation.name} in {eta} mins</div>
                        </div>

                    </div>
                )
            })}
        </div>
    )
}

export default BusList;