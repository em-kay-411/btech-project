const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    id: {
        type: String
    },
    route: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station'
        }]
    }
})

module.exports = new mongoose.model('Bus', busSchema);