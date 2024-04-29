const Station = require('../models/station');
const Bus = require('../models/bus');
const fs = require('fs');
const station = require('../models/station');

const getStationNameByID = async (stationID) => {
    try{
        const stationObj = await Station.findById(stationID);
        return stationObj.name;
    }
    catch(err){
        console.log(err);
    }
}

const getStationPositionByID = async (stationID) => {
    try{
        const stationObj = await Station.findById(stationID);
        const position = {latitude : stationObj.latitude, longitude : stationObj.longitude};
        return position;
    }
    catch(err){
        console.log(err);
    }
}

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

const getBusRoute = async (busID) => {
    try{
        const busObj = await Bus.findOne({id : busID});
        const route = [];
        for(let i=0; i<busObj.route.length; i++){
            const stationObj = await Station.findById(busObj.route[i].station);
            route.push({ name : stationObj.name, latitude: stationObj.latitude, longitude: stationObj.longitude, crossed : busObj.route[i].crossed});
        }

        return route;
    } catch(err){
        console.log(err);
    }
}

const insertNewBusOnExistingRouteById = async (id, route) => {
    if (!checkRoute(route)) {
        console.log('the root does not exist.. Try using another function to enter new route simultanoeusly');
        return;
    }

    const routeArray = route.map((element) => {
        return ({
            station : element,
            crossed : false
        })
    })

    try {
        const busObj = new Bus({
            id: id,
            route: routeArray
        })

        await busObj.save();

        for (let i = 0; i < routeArray.length; i++) {
            await Station.findByIdAndUpdate(routeArray[i], { $push: { buses: busObj._id } });
        }

        console.log('Route entered succesfully');
    } catch (err) {
        console.log(err);
    }
}

const insertNewBusOnExistingRouteByName = async (id, routeByName) => {
    const route = await getStationIdsByName(routeByName);
    console.log(route);

    const routeArray = route.map((element) => {
        return ({
            station : element,
            crossed : false
        })
    })

    try {
        const busObj = new Bus({
            id: id,
            route: routeArray
        })

        await busObj.save();

        for (let i = 0; i < route.length; i++) {
            console.log(`Adding bus ${id} to ${route[i].station}`);
            await Station.findByIdAndUpdate(route[i].station, { $push: { buses: busObj._id } });
        }

        console.log('Route entered succesfully');
    } catch (err) {

        console.log(err);
    }
}

const updateExistingBusRoute = async(id, routeByName) => {
    deleteBus(id);
    insertNewBusOnExistingRouteByName(id, routeByName);
}

const deleteBus = async (id) => {
    try {
        const busObj = await Bus.findOne({ id: id });
        const route = busObj.route;

        for (let i = 0; i < route.length; i++) {
            await Station.findByIdAndUpdate(route[i].station, { $pull: { buses: busObj._id } });
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

const getStationIdByName = async (stationName) => {
    const stationObj = await Station.findOne({ name: stationName });
    return stationObj._id;
}

const getBusIdsByNo = async (busesByNo) => {
    const buses = [];
    for (let i = 0; i < busesByNo.length; i++) {
        try {
            const busObj = await Bus.findOne({ id: busesByNo[i] });
            buses.push(busObj._id);
        } catch (err) {
            console.log(err);
        }
    }
}

const insertNewStationByNameOfRoutes = async (name, neighbouringStations) => {
    const neighbouring_stations = await getStationIdsByName(neighbouringStations);
    const stationObj = new Station({ name: name, neighbouring_stations: neighbouring_stations });
    await stationObj.save();

    for (let i = 0; i < neighbouring_stations.length; i++) {
        try {
            await Station.findByIdAndUpdate(neighbouring_stations[i], { $push: { neighbouring_stations: stationObj._id } });
        } catch (err) {
            console.log(err);
        }
    }
}

const insertNewStationByIdOfRoutes = async (name, neighbouring_stations) => {
    const stationObj = new Station({ name: name, neighbouring_stations: neighbouring_stations });
    stationObj.save();

    for (let i = 0; i < neighbouring_stations.length; i++) {
        try {
            await Station.findByIdAndUpdate(neighbouring_stations[i], { $push: { neighbouring_stations: stationObj._id } });
        } catch (err) {
            console.log(err);
        }
    }
}

const deleteStationByName = async (stationName) => {
    const stationObj = await Station.findOne({ name: stationName });
    const neighbours = stationObj.neighbouring_stations;

    for (let i = 0; i < neighbours.length; i++) {
        try {
            await Station.findByIdAndUpdate(neighbours[i], { $pull: { neighbouring_stations: stationObj._id } });
        } catch (err) {
            console.log(err);
        }
    }
    await stationObj.deleteOne();
}

const deleteStationById = async (id) => {
    const stationObj = await Station.findById(id);
    const neighbours = stationObj.neighbouring_stations;

    for (let i = 0; i < neighbours.length; i++) {
        try {
            await Station.findByIdAndUpdate(neighbours[i], { $pull: { neighbouring_stations: stationObj._id } });
        } catch (err) {
            console.log(err);
        }
    }
    await stationObj.deleteOne();
}

const breadthFirstSearch = async (source, destination) => {
    const json = await fs.promises.readFile(process.env.DATA_PATH, 'utf8');
    const data = JSON.parse(json);

    const paths = [];

    const queue = [];
    const visited = new Set();
    queue.push([source, [source]]);

    while (queue.length > 0) {
        const [current, path] = queue.shift();

        if (current === destination) {
            if (!paths.includes(path)) {
                paths.push(path);
            }
        }
        visited.add(current);
        const neighbours = data[current];
        for (const neighbour of neighbours) {
            if (!visited.has(neighbour)) {
                queue.push([neighbour, [...path, neighbour]]);
            }
        }
    }

    // console.log(paths);

    return paths;
}

const findRoute = async (source, destination) => {
    const possibleRoutes = await breadthFirstSearch(source, destination);
    return possibleRoutes;
}

function intersection(arr1, arr2) {
    return arr1.filter(value => arr2.includes(value));
}

const populateBusesData = async(buses) =>{
    const docs = await Bus.find({ _id : { $in : buses}});
    return docs.map(bus => bus.toJSON());
}

const getCommonBuses = async (source, destination) => {
    const sourceObj = await Station.findOne({ name: source });
    console.log('solved');
    const destinationObj = await Station.findOne({ name: destination });
    const buses = intersection(sourceObj.buses, destinationObj.buses);
    const busObjects = populateBusesData(buses);
    return busObjects;
}

const getPathGuide = async (route) => {
    let source = 0;
    let destination = route.length - 1;
    let currentDestination = destination;
    const pathGuide = [];

    while (source != destination && source != currentDestination) {
        const buses = await getCommonBuses(route[source], route[currentDestination]);
        if (buses.length > 0) {
            pathGuide.push({source : route[source], destination : route[currentDestination], buses: buses});
            source = currentDestination;
            currentDestination = destination;
        }
        else{
            currentDestination = currentDestination - 1;
        }
    }

    return pathGuide;
}

const findOptions = async (source, destination) => {
    const possibleRoutes = await findRoute(source, destination);
    const options = [];             // Will contain [{source, destination, [buses]}]
    for (let i = 0; i < possibleRoutes.length; i++) {
        const pathGuide = await getPathGuide(possibleRoutes[i]);
        if(pathGuide.length > 0 && pathGuide[pathGuide.length - 1].destination === possibleRoutes[i][possibleRoutes[i].length - 1] && !options.some(opt => JSON.stringify(opt) === JSON.stringify(pathGuide))){ // Check if pathGuide is not present in the options array
            options.push(pathGuide);
        }        
    }

    console.log(options);
    return options;
}

const markNextStationCrossedForBus = async(busID) => {
    const busObj = await Bus.findOne({ id : busID });

    const route = busObj.route;
    console.log(route);
    let i = 0;
    for(i=0; i<route.length; i++){
        if(!route[i].station.crossed){
            break;
        }
    }

    if(i === route.length){
        return error;
    }

    route[i].crossed = true;
    await busObj.save();
    return;
}

module.exports = {
    findOptions,
    getBusRoute,
    getStationNameByID,
    getStationPositionByID,
    insertNewStationByIdOfRoutes,
    insertNewStationByNameOfRoutes,
    insertNewBusOnExistingRouteByName,
    insertNewBusOnExistingRouteById,
    updateExistingBusRoute,
    deleteBus,
    deleteStationByName,
    deleteStationById,
    markNextStationCrossedForBus
};