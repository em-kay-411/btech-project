const fs = require('fs');
const mongoose = require('mongoose');
const Station = require('../models/station');
const axios = require('axios');

const main = async () => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    fs.readFile('stations.txt', 'utf8', (err, data) => {
        const stationNames = data.split('\n');
        let count = 0;

        stationNames.forEach(async (name) => {
            try {
                const stationObj = await Station.findOne({name : name});
                if(!stationObj.latitude && !stationObj.longitude){
                    const encodedName = encodeURIComponent(`${name} Bus Stand, Pune`);
                    const apiEndpoint = `https://api.tomtom.com/search/2/geocode/${encodedName}.json?key=YwnGgYME2e9Yhc5cENrbjM5NyRibrscM`;
                    const response = await axios.get(apiEndpoint);

                    const position = response.data.results[0].position;
                    console.log(position);
                    
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
    
}

main();