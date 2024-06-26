const dotenv = require('dotenv');
dotenv.config();
const twilio = require('twilio');
const crypto = require('crypto');
const axios = require('axios');
const {insertNewBusOnExistingRouteByName, getBusRoute, getStationNameByID, getStationPositionByID, markNextStationCrossedForBus} = require('../utils/crud')
const TWILIO_ACCOUNT_AUTH_TOKEN = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_SID;
const key = process.env.MAPS_API_KEY;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_ACCOUNT_AUTH_TOKEN);

const users = [];
const busesConnected = [];

const verifyAdmin = async (req, res) => {
    const mobileNo = req.body.mobileNo;
    try{
        client.verify.v2.services(TWILIO_SERVICE_ID)
        .verifications
        .create({ to: mobileNo, channel: 'sms' })
        .then(() => {
            res.status(200).json({message : 'OTP has been sent to the mobile number'});
        });        
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
}

const verificationCheck = async(req, res) => {
    const code = req.body.code;
    const mobileNo = req.body.mobileNo;

    try{
        client.verify.v2.services(TWILIO_SERVICE_ID)
            .verificationChecks
            .create({to: mobileNo, code: code})
            .then(verification_check => console.log(verification_check.status))
            .then(() => {
                const cookie = crypto.createHash('md5').update(mobileNo).digest('hex');
                console.log(cookie);
                users.push(cookie);
                res.status(200).json({cookie : cookie, message : 'Successful authentication'});
            });       
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
   
}

const addBus = async(req, res) => {
    const bus = req.body.bus;
    const route = req.body.route;

    try{
        await insertNewBusOnExistingRouteByName(bus, route);
        res.status(200).json({message : 'Bus successfully entered'});
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
}

const getRouteForBus = async (req, res) => {
    const bus = req.body.bus;
    if(!busesConnected.includes(bus) && req.body.fromBus){
        console.log('adding bus')
        busesConnected.push(bus);
    }    

    try{
        const busRoute = await getBusRoute(bus);
        res.status(200).json({route : busRoute});
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
}

const getConnectedBuses = async(req, res) => {
    res.status(200).json({ busesConnected : busesConnected});
}

const getStationNameFromID = async(req, res) => {
    const stationID = req.body.stationID;

    try{
        const stationName = await getStationNameByID(stationID);
        res.status(200).json({ stationName : stationName });
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
}

const getStationPositionFromID = async (req, res) => {
    const stationID = req.body.stationID;
    try{
        const position = await getStationPositionByID(stationID);
        res.status(200).json({position : position});
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
}

const markNextStationCrossed = async(req, res) => {
    const busID = req.body.busID;

    try{
        await markNextStationCrossedForBus(busID);
        res.status(200).json({message : 'marked crossed'});
    }
    catch(err){
        console.log(err);
    }
}


const getETA = async (req, res) => {
    const sourceLatitude = req.query.sourceLat;
    const sourceLongitude = req.query.sourceLng;
    const destinationLatitude = req.query.destinationLat;
    const destinationLongitude = req.query.destinationLng;

    const response = await axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${sourceLatitude},${sourceLongitude}:${destinationLatitude},${destinationLongitude}/json?&vehicleHeading=90&sectionType=traffic&report=effectiveSettings&routeType=eco&traffic=true&avoid=unpavedRoads&travelMode=car&vehicleMaxSpeed=80&vehicleCommercial=false&vehicleEngineType=combustion&key=${key}`)

    const eta = response.data.routes[0].summary.travelTimeInSeconds;
    res.status(200).json({eta : eta});
}

// For every new route, send mobile no or hash it to a cookie with every request as it serves authentication

module.exports = {
    verifyAdmin,
    verificationCheck,
    addBus,
    getStationPositionFromID,
    getRouteForBus,
    getStationNameFromID,
    getConnectedBuses,
    markNextStationCrossed,
    getETA
}