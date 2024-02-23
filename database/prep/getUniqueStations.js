const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const page = 'https://moovitapp.com/index/en/public_transit-lines-Pune-5884-1509110#google_vignette';
const routes = [];
const stations = new Set();
let count = 0;

const getLinks = async () => {
    const response = await axios.get(page);
    const $ = cheerio.load(response.data);
    const element = $('.line-data').toArray();  
    // console.log(element); 
    
    for(let i=0; i<element.length; i++){
        const link = $(element[i]).find('a').attr('href');
        routes.push(link);
        console.log(link);
    }    
}

const getStationNames = async() => {
    for(let i=0; i<routes.length; i++){
        const link = routes[i];
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const elements = $('.stop-wrapper').toArray();

        for(let j=0; j<elements.length; j++){
            count++;
            const stationName = $(elements[j]).find('h3').html();
            if(stations.has(stationName)){
                console.log('already present');
            }
            else{
                stations.add(stationName);
                console.log(stationName);
            }            
        }
    }
}

const saveToFile = async() => {
    stations.forEach((station) => {
        fs.appendFile('stations.txt', `${station}\n`, () => {
            console.log(station);
        })
    })
}


const main  = async () => {
    await getLinks();
    await getStationNames();
    await saveToFile();
    console.log('Total unique stations found : ', stations.size);
    console.log('Total stations found : ', count);
}

main();