const fs = require('fs');
const mongoose = require('mongoose');
const Station = require('../models/station');

const main = async () => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    fs.readFile('stations.txt', 'utf8', (err, data) => {
        const stationNames = data.split('\n');

        stationNames.forEach((name) => {
            const obj = new Station({ name: name });
            console.log(`Creating Station ${name}`);
            obj.save();
        })
    })
}

main();