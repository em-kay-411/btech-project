const mongoose = require('mongoose');
const Station = require('./models/station');
const Bus = require('./models/bus');

const checkRoute = async (route) => {
    if (route.length == 0) {
        return false;
    }
    let prev = route[0];

    for (let i = 1; i < route.length; i++) {
        const prevObj = await Station.findById(prev);
        if (!prevObj.neighbouring_stations.includes(route[i])) {
            return false;
        }
        prev = route[i];
    }

    return true;
}

const insertNewBus = async (id, route) => {
    if (!checkRoute(route)) {
        console.log('the root does not exist.. Try using another function to enter new route simultanoeusly');
        return;
    }

    try {
        const busObj = new Bus({
            id: id,
            route: route
        })

        await busObj.save();

        for (let i = 0; i < route.length; i++) {
            await Station.findByIdAndUpdate(route[i], { $push: { buses: busObj._id } });
        }

        console.log('Route entered succesfully');
    } catch (err) {
        console.log(err);
    }
}

const deleteBus = async (id) => {
    try {
        const busObj = await Bus.findOne({ id: id });
        const route = busObj.route;

        for (let i = 0; i < route.length; i++) {
            await Station.findByIdAndUpdate(route[i], { $pull: { buses: busObj._id } });
        }

        await Bus.deleteOne({_id : busObj._id});
    } catch (err) {
        console.log(err);
    }

}

module.exports = {
    insertNewBus,
    deleteBus
};