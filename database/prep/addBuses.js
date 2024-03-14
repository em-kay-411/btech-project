const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Bus = require('../models/bus');
const { insertNewBusOnExistingRouteByName, deleteBus } = require('../crud');

const page = 'https://moovitapp.com/index/en/public_transit-lines-Pune-5884-1509110#google_vignette';
const routes = [];

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

const deleteBuses = async() => {
    const buses = await Bus.find({});
    console.log(buses.length);

    for(let i=0; i<buses.length; i++){
        await deleteBus(buses[i].id);
    }
}

const insertBuses = async () => {
    for (let i = 0; i < routes.length; i++) {
        const link = routes[i];
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const elements = $('.stop-wrapper').toArray();
        const busNameHeading = $('.mvf-wrapper');

        const busID = busNameHeading.find('h1').html().split(' ')[0];

        const route = [];

        for (let j = 0; j < elements.length; j++) {
            const stationName = $(elements[j]).find('h3').html();
            route.push(stationName);
            console.log('Adding ' + busID + ' to route ' + stationName);
        }

        await insertNewBusOnExistingRouteByName(busID, route);
    }
}

const main = async () => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await getLinks();
    await insertBuses();
    // await deleteBuses();
}

main();