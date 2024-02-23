const mongoose = require('mongoose');
const {insertNewStationByIdOfRoutes,
    insertNewStationByNameOfRoutes,
    insertNewBusOnExistingRouteByName,
    insertNewBusOnExistingRouteById,
    deleteBus,
    deleteStationByName,
    deleteStationById} = require('./crud');

const main = async() => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const route = ["Shivajinagar", "C.O.E.P.Hostel (Towards Shivaji Maharaj Road)", "Chhatrapati Shivaji Maharaj Putala Ma.Na.Pa.", "Manapa Bhavan - Dengle Pul"];
    deleteStationByName('mohit');
}

main();