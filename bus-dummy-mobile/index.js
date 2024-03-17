const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
const busIDElement = document.getElementById('busID');
const brokerURL = 'ws://192.168.0.107:9001/';
const mapDiv = document.getElementById("map");
const subscribeButton = document.getElementById('subscribe');
const sendMessageButton = document.getElementById('sendMessage');
const messageReceived = document.getElementById('message-received');
const message = document.getElementById('message');
let prevLatitude;
let prevLongitude;
let client;
let clientID;
let busID;
let id;

// const enableMQTTSubscription = () => {
//     client.on('connect', function () {
//         console.log('Connected to MQTT broker');
//     });

//     client.on('error', function (err) {
//         console.error(`Error: ${err}`);
//     });

//     client.subscribe(busID, function(err) {
//         if (err) {
//             console.error(`Error publishing to MQTT: ${err}`);
//         } else {
//             console.log(`Subscribed`);
//         }
//     })

//     client.on('message', function(topic, message){
//         const data = JSON.parse(message);
//         const latitude = data.latitude;
//         const longitude = data.longitude;

//         console.log(`Latitude : ${latitude} <br> Longitude : ${longitude}`);

//         document.getElementById('location').innerHTML = `Latitude : ${latitude} <br> Longitude : ${longitude}`;
//     })
// }

const enableMQTT = () => {
    client.on('connect', function () {

        client.publish('universal', `connect/${busID}`, function (err) {
            if (err) {
                console.error(`Error publishing to MQTT: ${err}`);
            } else {
                console.log(`Subscribed`);
            }
        })

        console.log('Connected to MQTT broker');

    });

    client.on('error', function (err) {
        console.error(`Error: ${err}`);
    });

    // Topic to receive messages from admin
    client.subscribe(`adminToBus/${busID}`, function (err) {
        if (err) {
            console.error(`Error publishing to MQTT: ${err}`);
        } else {
            console.log(`Subscribed`);
        }
    })

    client.on('message', function (topic, message) {
        console.log(topic, message.toString());
        messageReceived.innerHTML = `${message.toString()}`;
    })
}


const updatePosition = async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const nextStation = {name : 'COEP Hostel', latitude : 18.5287368, longitude : 73.8504897};
    const previousStation = {name : 'Shivajinagar', latitude : 18.5318164, longitude: 73.8450759};
    const eta = 2;

    const message = { latitude, longitude, nextStation, previousStation, eta };
    const topic = `location/${busID}`;

    // Topic to send location everywhere
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

// const subscribeTo = async() => {
//     if(!busID){
//         mapDiv.innerHTML = `<p>Enter a valid BusID</p>`;
//         return;
//     }
//     client = await mqtt.connect(brokerURL, {clientID});
//     enableMQTTSubscription();
// }

const getLocation = async () => {
    if (!busID) {
        mapDiv.innerHTML = `<p>Enter a valid BusID</p>`;
        return;
    }
    client = await mqtt.connect(brokerURL, { clientID });
    enableMQTT();
    try {
        id = navigator.geolocation.watchPosition(updatePosition, error, options);
    } catch (err) {
        console.log(err);
        alert("Geolocation is not supported by this browser.");
    }
}

busIDElement.onchange = () => {
    busID = busIDElement.value;
    clientID = busID;
}

sendMessageButton.onclick = () => {
    client.publish(`busToAdmin/${busID}`, message.value, function (err) {
        if (err) {
            console.error(`Error publishing to MQTT: ${err}`);
        } else {
            console.log(`Published message to ${busID}: ${message}`);
        }
    })
}