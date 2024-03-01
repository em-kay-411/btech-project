const mongoose = require('mongoose');
const { findOptions,
    insertNewStationByIdOfRoutes,
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
    // insertNewBusOnExistingRouteByName('6540', ["Shivajinagar", "C.O.E.P.Hostel (Towards Shivaji Maharaj Road)"]);
    const options = await findOptions('Vetalbaba Chowk', 'C.O.E.P.Hostel (Towards Jangli Maharaj Road)');
    console.log(options[1][0].buses);
    // deleteBus('1');
}

main();