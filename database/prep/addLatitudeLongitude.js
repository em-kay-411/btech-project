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

    // const encodedName = encodeURIComponent(`Shivajinagar Bus, Pune`);
    // console.log(encodedName);
    // const apiEndpoint = `https://api.tomtom.com/search/2/geocode/${encodedName}.json?key=YwnGgYME2e9Yhc5cENrbjM5NyRibrscM`;
    // const response = await axios.get(apiEndpoint);

    // const possiblePositions = response.data.results;

    // let position;
    // let i = 0;

    // while (i < possiblePositions.length) {
    //     if (possiblePositions[i].position.lat >= 18 && possiblePositions[i].position.lat < 19) {
    //         position = possiblePositions[i].position;
    //     }
    //     i++;
    // }
    // console.log('Position', position);
    // const station = await Station.updateOne({ name: 'Shivajinagar' }, { $set: { latitude: position.lat, longitude: position.lon } });
    // console.log(station);
    // console.log('Station location updated successfully for ', 'Shivajinagar');

    fs.readFile('stations.txt', 'utf8', (err, data) => {
        const stationNames = data.split('\n');
        let count = 0;

        stationNames.forEach(async (name) => {
            try {
                const stationObj = await Station.findOne({name : name});
                if(!stationObj.latitude && !stationObj.longitude){
                    const encodedName = encodeURIComponent(`${name} Bus, Pune`);
                    const apiEndpoint = `https://api.tomtom.com/search/2/geocode/${encodedName}.json?key=YwnGgYME2e9Yhc5cENrbjM5NyRibrscM`;
                    const response = await axios.get(apiEndpoint);

                    const possiblePositions = response.data.results;

                    let position;
                    let i =0;

                    while(i < possiblePositions.length){
                        if(possiblePositions[i].position.lat >= 18 && possiblePositions[i].position.lat < 19){
                            position = possiblePositions[i].position;
                        }
                        i++;
                    }
                    console.log('Position', position);
                    const station = await Station.updateOne({name : name}, {$set : {latitude : position.lat, longitude : position.lon}});
                    console.log(station);
                    console.log('Station location updated successfully for ', name);
                }
                else{
                    console.log('already present');
                    count++;
                }

            } catch (error) {
                console.error(error.message);
            }
        })

        console.log('Already present ', count);
    })

    return 0;
}

main();