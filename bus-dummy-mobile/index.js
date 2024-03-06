const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
const busIDElement = document.getElementById('busID');
const brokerURL = 'ws://10.1.150.196:9001/';
const mapDiv = document.getElementById("map");
const subscribeButton = document.getElementById('subscribe');
let prevLatitude;
let prevLongitude;
let client;
let clientID;
let busID;
let id;

const enableMQTTSubscription = () => {
    client.on('connect', function () {
        console.log('Connected to MQTT broker');
    });
    
    client.on('error', function (err) {
        console.error(`Error: ${err}`);
    });
    
    client.subscribe(busID, function(err) {
        if (err) {
            console.error(`Error publishing to MQTT: ${err}`);
        } else {
            console.log(`Subscribed`);
        }
    })
    
    client.on('message', function(topic, message){
        const data = JSON.parse(message);
        const latitude = data.latitude;
        const longitude = data.longitude;

        console.log(`Latitude : ${latitude} <br> Longitude : ${longitude}`);

        document.getElementById('location').innerHTML = `Latitude : ${latitude} <br> Longitude : ${longitude}`;
    })
}

const enableMQTT = () => {
    client.on('connect', function () {
        console.log('Connected to MQTT broker');
    });
    
    client.on('error', function (err) {
        console.error(`Error: ${err}`);
    });
}


const updatePosition = async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const message = {latitude, longitude};
    const topic = busID;

    client.publish(topic, JSON.stringify(message), function (err) {
        if (err) {
            console.error(`Error publishing to MQTT: ${err}`);
        } else {
            console.log(`Published message to ${topic}: ${message}`);
        }
    });

    mapDiv.innerHTML = `<p>Latitude: ${latitude}</p><p>Longitude: ${longitude}</p>`;
}

function error(err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
}

const subscribeTo = async() => {
    if(!busID){
        mapDiv.innerHTML = `<p>Enter a valid BusID</p>`;
        return;
    }
    client = await mqtt.connect(brokerURL, {clientID});
    enableMQTTSubscription();
}

const getLocation = async() => {
    if(!busID){
        mapDiv.innerHTML = `<p>Enter a valid BusID</p>`;
        return;
    }
    client = await mqtt.connect(brokerURL, {clientID});
    enableMQTT();
    try{
        id = navigator.geolocation.watchPosition(updatePosition, error, options);
    } catch(err){
        console.log(err);
        alert("Geolocation is not supported by this browser.");
    }
}

busIDElement.onchange = () => {
    busID = busIDElement.value;
    clientID = busID;
}