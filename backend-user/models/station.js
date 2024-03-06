const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: {
        type: String
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