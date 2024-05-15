const { findOptions } = require('../utils/crud');
const Station = require('../models/station');

const findOptionsPOSTReq = async (req, res) => {
    const source = req.body.source;
    const destination = req.body.destination;

    console.log(source, destination);

    try{
        const options = await findOptions(source, destination);
        const stationObj = await Station.findOne({name : source});
        const latitude = stationObj.latitude;
        const longitude = stationObj.longitude;
        res.status(200).json({options : options, source : {latitude, longitude}});
    } catch(error){
        res.status(500).json({message : error.message});
    }
    
}

module.exports = {
    findOptionsPOSTReq
}