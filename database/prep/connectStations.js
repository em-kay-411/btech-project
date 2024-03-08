const fs = require('fs');
const mongoose = require('mongoose');
const Station = require('../models/station');
let json;

const addToDatabase = async () => {
    try{
        const data = await fs.promises.readFile('stations.txt', 'utf8');
        const stationNames = data.split('\n');

        for (const name of stationNames) {
            const obj = await Station.findOne({name : name});
            console.log(obj);
            if(obj){
                const neighbours = json[name];
                for(let i=0; i<neighbours.length; i++){
                    neighbours[i] = await Station.findOne({name : neighbours[i]});
                }
                console.log('Adding connections to database for ', name);
                obj.neighbouring_stations = neighbours;
                await obj.save();
                console.log('Done adding for', name);
            }
            else{
                console.log('no such name found');
            }            
        }
    } catch(err){
        console.log(err);
    }   

}

const getArray = async () => {
    const data = await fs.promises.readFile('stations.txt', 'utf8');
    const stationNames = data.split('\n');
    
    console.log('[');

    for(let i=0; i<stationNames.length; i++){
        console.log(`'` + stationNames[i] + `'` + ',');
    }

    console.log(']');
}

const main = async () => {
    // await mongoose.connect('mongodb://localhost:27017/btech-project', {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    // });

    // fs.readFile('stationConnections.json', 'utf8', (err, data) => {
    //     if (err) {
    //         console.log('error reading json');
    //         return;
    //     }

    //     try {
    //         json = JSON.parse(data);
    //         addToDatabase(json).then(console.log('Connections added to database successfully'));
    //     } catch (error) {
    //         console.log(error);
    //     }
    // })

    // console.log(json);

    getArray();


}

main();