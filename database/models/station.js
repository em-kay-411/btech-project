const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: {
        type: String
    },
    latitude : {
        type : Number
    },
    longitude : {
        type : Number
    },
    neighbouring_stations: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station'
        }]
    },
    buses: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus'
        }]
    }
})

module.exports = new mongoose.model('Station', stationSchema);