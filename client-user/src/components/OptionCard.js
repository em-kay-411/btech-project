import '../css/OptionCard.css'
import {useEffect} from 'react';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GpsFixedTwoToneIcon from '@mui/icons-material/GpsFixedTwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';
import mqtt from 'mqtt';
import env from 'react-dotenv';
const brokerURL = env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerURL);


function OptionCard(props) {
    const stations = props.buses;
    const numOfChanges = props.numOfChanges;
    const onClick = props.onClick;

    useEffect(() => {
        const handleMessage = (topic, message) => {
            const bus = topic.split('/')[1];
            const location = JSON.parse(message);

            console.log(`Location of ${bus} : ${location.latitude}, ${location.longitude}`);
        }

        client.on('message', handleMessage);

        return () => {
            client.off('message', handleMessage);
        }
    })

    return (
        <div className="option-card" onClick={onClick}>
            <div className="bus-info">
                <DirectionsBusIcon className='bus-icon' style={{ fontSize: 60 }} />
                {(numOfChanges - 1 > 0) && (<div className="changes-count">{numOfChanges - 1} bus(s) to change </div>)}
            </div>
            {stations.map((transit, index) => {
                const uniqueBuses = new Set(transit.buses.map(element => element.id));
                uniqueBuses.forEach(bus => {
                    client.subscribe(`location/${bus}`, () => {
                        console.log(`subscribed to bus location from ${bus}`);
                    });
                })
                return (
                    <div key={index} className="transit-card">
                        <div className="buses-to-display">{Array.from(uniqueBuses).map((busNumber, i) => {                             
                            return (<div key={i} className='bus-number'>{busNumber}</div>) })}
                        </div>
                        <div className="transit-buses">
                            <div className="source-name"> <GpsFixedTwoToneIcon fontSize='small' color='success'/>{transit.source}</div>
                            <div className="destination-name"> <LocationOnTwoToneIcon fontSize='small' color='error'/>{transit.destination}</div>
                        </div>
                    </div>
                )

            })}
        </div>
    )
}

export default OptionCard