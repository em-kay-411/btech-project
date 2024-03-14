const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    id: {
        type: String
    },
    route: {
        type: [{
            station: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Station'
            },
            crossed: {
                type: Boolean,
                default: false // You can set a default value if needed
            }
        }]
    }
})

module.exports = new mongoose.model('Bus', busSchema);