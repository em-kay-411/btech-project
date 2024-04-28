const mongoose = require('mongoose');
const axios = require('axios');
const Bus = require('./models/bus')
const { findOptions,
    insertNewStationByIdOfRoutes,
    insertNewStationByNameOfRoutes,
    insertNewBusOnExistingRouteByName,
    insertNewBusOnExistingRouteById,
    deleteBus,
    deleteStationByName,
    deleteStationById, 
    setSomething
} = require('./crud');
  

const main = async() => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // const route = ["Shivajinagar", "C.O.E.P.Hostel (Towards Shivaji Maharaj Road)", "Chhatrapati Shivaji Maharaj Putala Ma.Na.Pa.", "Manapa Bhavan - Dengle Pul"];
    // insertNewBusOnExistingRouteByName('6540', ["Shivajinagar", "C.O.E.P.Hostel (Towards Shivaji Maharaj Road)"]);
    console.time("route");
    const options = await findOptions('Pune Railway Station', 'Vetalbaba Chowk');
    console.timeEnd("route");
    // // console.log(options);
    // // const obj = await Bus.findById('65f285a1c37e741ba8a2ac75');
    // options.forEach((option) => {
    //     option.forEach((transit) => {
    //         console.log(transit.source, transit.destination);
    //         console.log(transit.buses);
    //     })
    // })
    // deleteBus('1');

    
}

main();