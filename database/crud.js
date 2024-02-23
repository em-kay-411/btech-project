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

const insertNewBusOnExistingRouteById = async (id, route) => {
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

const insertNewBusOnExistingRouteByName = async (id, routeByName) => {
    const route = await getStationIdsByName(routeByName);
    console.log(route);

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

        await busObj.deleteOne();
        console.log('Done deleting bus')
    } catch (err) {
        console.log(err);
    }

}

const getStationIdsByName = async (stationNames) => {
    const stations = [];
    for (let i = 0; i < stationNames.length; i++) {
        try {
            console.log(stationNames[i]);
            const routeObj = await Station.findOne({ name: stationNames[i] });
            stations.push(routeObj._id);
        } catch (err) {
            console.log(err);
        }
    }
    return stations;
}

const getStationIdByName = async(stationName) => {
    const stationObj = await Station.findOne({name : stationName});
    return stationObj._id;
}

const getBusIdsByNo = async (busesByNo) => {
    const buses = [];
    for(let i=0; i<busesByNo.length; i++){
        try{
            const busObj = await Bus.findOne({ id : busesByNo[i] });
            buses.push(busObj._id);
        } catch (err) {
            console.log(err);
        }
    }
}

const insertNewStationByNameOfRoutes = async(name, neighbouringStations) => {
    const neighbouring_stations = await getStationIdsByName(neighbouringStations);
    const stationObj = new Station({ name : name, neighbouring_stations : neighbouring_stations});
    await stationObj.save();

    for(let i=0; i<neighbouring_stations.length; i++){
        try{
            await Station.findByIdAndUpdate(neighbouring_stations[i], {$push : { neighbouring_stations : stationObj._id }});
        } catch(err){
            console.log(err);
        } 
    }
}

const insertNewStationByIdOfRoutes = async(name, neighbouring_stations) => {
    const stationObj = new Station({ name : name, neighbouring_stations : neighbouring_stations});
    stationObj.save();

    for(let i=0; i<neighbouring_stations.length; i++){
        try{
            await Station.findByIdAndUpdate(neighbouring_stations[i], {$push : { neighbouring_stations : stationObj._id }});
        } catch(err){
            console.log(err);
        }        
    }
}

const deleteStationByName = async(stationName) => {
    const stationObj = await Station.findOne({name : stationName});
    const neighbours = stationObj.neighbouring_stations;

    for(let i = 0; i<neighbours.length; i++){
        try{
            await Station.findByIdAndUpdate(neighbours[i], {$pull : {neighbouring_stations : stationObj._id}});
        } catch (err) {
            console.log(err);
        }        
    }
    await stationObj.deleteOne();
}

const deleteStationById = async(id) => {
    const stationObj = await Station.findById(id);
    const neighbours = stationObj.neighbouring_stations;

    for(let i = 0; i<neighbours.length; i++){
        try{
            await Station.findByIdAndUpdate(neighbours[i], {$pull : {neighbouring_stations : stationObj._id}});
        } catch (err) {
            console.log(err);
        }        
    }
    await stationObj.deleteOne();
}

module.exports = {
    insertNewStationByIdOfRoutes,
    insertNewStationByNameOfRoutes,
    insertNewBusOnExistingRouteByName,
    insertNewBusOnExistingRouteById,
    deleteBus,
    deleteStationByName,
    deleteStationById
};