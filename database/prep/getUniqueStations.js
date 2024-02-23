const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const page = 'https://moovitapp.com/index/en/public_transit-lines-Pune-5884-1509110#google_vignette';
const routes = [];
const stations = new Set();
const connections = new Map();
let count = 0;

const getLinks = async () => {
    const response = await axios.get(page);
    const $ = cheerio.load(response.data);
    const element = $('.line-data').toArray();
    // console.log(element); 

    for (let i = 0; i < element.length; i++) {
        const link = $(element[i]).find('a').attr('href');
        routes.push(link);
        console.log(link);
    }
}

const getStationNames = async () => {
    for (let i = 0; i < routes.length; i++) {
        const link = routes[i];
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const elements = $('.stop-wrapper').toArray();

        for (let j = 0; j < elements.length; j++) {
            count++;
            const stationName = $(elements[j]).find('h3').html();
            if (stations.has(stationName)) {
                console.log('already present');
            }
            else {
                stations.add(stationName);
                console.log(stationName);
            }
        }
    }
}

const connectStationNames = async () => {
    for(let i=0; i<routes.length; i++){
    const link = routes[i];
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    const elements = $('.stop-wrapper').toArray();

    for (let j = 0; j < elements.length - 1; j++) {
        const u = $(elements[j]).find('h3').html();
        const v = $(elements[j + 1]).find('h3').html();

        if (!connections.has(u)) {
            connections.set(u, new Set());            
        }
        console.log(`connecting ${u} to ${v}`);
        connections.get(u).add(v);

        if (!connections.has(v)) {
            connections.set(v, new Set());            
        }
        console.log(`connecting ${v} to ${u}`);
        connections.get(v).add(u);
    }
    }
}

const saveToFile = async () => {
    stations.forEach((station) => {
        fs.appendFile('stations.txt', `${station}\n`, () => {
            console.log(station);
        })
    })
}

// const saveToJSON = async(connections) => {
//     const json = {};

//     connections.forEach((set, key) => {
//         json[key] = Array.from(set);
//     })
//     const jsonString = JSON.stringify(json, null, 2)

//     return jsonString;
// }


const main = async () => {
    await getLinks();
    // await getStationNames();
    // await saveToFile();
    await connectStationNames();

    console.log(connections);
    const json = {};

    connections.forEach((set, key) => {
        json[key] = Array.from(set);
    })
    const jsonString = JSON.stringify(json, null, 2);

    fs.writeFile('stationConnections.json', jsonString, (err) => {
        if(!err){
            console.log('Connections Established Succesfully!\nGraph of stations created');
        }
    });
}

main();