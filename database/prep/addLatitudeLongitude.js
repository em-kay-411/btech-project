const fs = require('fs');
const mongoose = require('mongoose');
const Station = require('../models/station');
const axios = require('axios');
const { encode } = require('punycode');

const main = async () => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const encodedName = encodeURIComponent(`Appa Balwant Chowk, Pune`);
    console.log(encodedName);
    const apiEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedName}&key=AIzaSyB2zhvHVb_IKgDBRMCwr3-taL8K8lK8-90`;
    const response = await axios.get(apiEndpoint);

    const possiblePositions = response.data.results;

    let position;
    let i = 0;

    while (i < possiblePositions.length) {
        if ((possiblePositions[i].geometry.location.lat >= 18.165 && possiblePositions[i].geometry.location.lat < 19.2) && (possiblePositions[i].geometry.location.lng >= 73.336 && possiblePositions[i].geometry.location.lng < 74.22)) {
            position = possiblePositions[i].geometry.location;
        }
        i++;
    }
    console.log('Position', position);
    const station = await Station.updateOne({ name: 'Appa Balwant Chowk' }, { $set: { latitude: position.lat, longitude: position.lng } });
    console.log(station);
    console.log('Station location updated successfully for ', 'Appa Balwant Chowk');

    // fs.readFile('stations.txt', 'utf8', (err, data) => {
    //     const stationNames = data.split('\n');
    //     let count = 0;

    //     stationNames.forEach(async (name) => {
    //         try {
    //             // const stationObj = await Station.findOne({ name: name });
    //             // if ((!stationObj.latitude && !stationObj.longitude) || (stationObj.latitude < 18.165 && stationObj.latitude) > 19.2 || (stationObj.longitude < 73.336 && stationObj.longitude > 74.22)) {
    //                 const encodedName = encodeURIComponent(`${name}, Pune`);
    //                 const apiEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedName}&key=AIzaSyB2zhvHVb_IKgDBRMCwr3-taL8K8lK8-90`;
    //                 const response = await axios.get(apiEndpoint);

    //                 const possiblePositions = response.data.results;

    //                 let position;
    //                 let i = 0;

    //                 while (i < possiblePositions.length) {
    //                     if ((possiblePositions[i].geometry.location.lat >= 18.165 && possiblePositions[i].geometry.location.lat < 19.2) && (possiblePositions[i].geometry.location.lng >= 73.336 && possiblePositions[i].geometry.location.lng < 74.22)) {
    //                         position = possiblePositions[i].geometry.location;
    //                     }
    //                     i++;
    //                 }
    //                 console.log('Position', position);
    //                 const station = await Station.updateOne({ name: name }, { $set: { latitude: position.lat, longitude: position.lon } });
    //                 console.log(station);
    //                 console.log('Station location updated successfully for ', name);
    //             // }
    //             // else {
    //             //     console.log('already present');
    //             //     count++;
    //             // }

    //         } catch (error) {
    //             console.error(error.message);
    //         }
    //     })

    //     console.log('Already present ', count);
    // })

    return 0;
}

main();