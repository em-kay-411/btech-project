import { Autocomplete, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from "react";
import allStations from '../stations';
import '../css/RouteArray.css'

function RouteArray() {

    const [stations, setStations] = useState([{ id: 0, value:'' }, { id: 1, value:'' }]);

    const handleStationChange = (stationID, value) => {
        const idx = stations.findIndex(station => station.id === stationID);

        const updatedArray = [...stations];

        if(idx !== -1){
            updatedArray[idx] = { id: stationID, value: value};
            setStations(updatedArray);
        }
    }

    const handleAddStation = (stationID) => {
        const updatedArray = [];

        let i = 0;
        while(i < stations.length && stations[i].id !== stationID){
            updatedArray.push(stations[i]);
            i++;
        }

        
        updatedArray.push(stations[i]);
        i++;

        updatedArray.push({id : stationID+1, value: ''});
        
        while(i < stations.length){
            updatedArray.push({ id : stations[i].id + 1, value : stations[i].value});
            i++;
        }

        setStations(updatedArray);
    }

    const handleRemoveStation = (stationID) => {
        const updatedArray = stations.filter((station) => station.id !== stationID);

        for(let i=0; i<updatedArray.length; i++){
            if(updatedArray[i].id > stationID){
                updatedArray[i] = {id : updatedArray[i].id-1, value: updatedArray[i].value};
            }
        }

        setStations(updatedArray);
    }

    return (
        <div className="route-array">
            {stations.map(station => (
                <div className="station-with-plus" key={station.id}>
                    <Autocomplete
                        className='side-panel-text'
                        disablePortal
                        id="side-panel-source-box"
                        options={allStations}
                        sx={{ height: 60 }}
                        onChange={(event, value) => {handleStationChange(station.id, value)}}
                        value={station.value}
                        renderInput={(params) => <TextField color='warning' {...params} label="station" />}
                    />
                    <div className="station-action">
                        <div className="action-icon" onClick={() => handleAddStation(station.id)}>
                            <AddIcon />
                        </div>

                        <div className="action-icon" onClick={() => handleRemoveStation(station.id)}>
                            <RemoveIcon />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default RouteArray;