import '../css/SidePanel.css'
import { useState } from 'react';
import { Autocomplete, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import allStations from '../stations'
import OptionCard from './OptionCard';
import axios from 'axios';

function SidePanel(props) {
    const backendURL = 'http://localhost:3050'
    const [source, setSource] = useState(props.source);
    const [destination, setDestination] = useState(props.destination);
    const [options, setOptions] = useState(props.options);

    const getOptions = async () => {
        const requestBody = {
            source: source,
            destination: destination
        }

        try {
            const response = await axios.post(backendURL, requestBody);
            console.log(options);
            setOptions(response.data.options);
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleSourceChange = (event, value) => {
        setSource(value);
    }

    const handleDestinationChange = (event, value) => {
        setDestination(value);
    }


    return (
        <>
            <div className={`${props.visibility ? 'side-panel-visible' : 'side-panel-hidden'}`} id="side-panel">
                <div className="side-panel-form">
                    <Autocomplete
                        className='side-panel-text'
                        disablePortal
                        id="side-panel-source-box"
                        options={allStations}
                        sx={{ height: 60 }}
                        onChange={handleSourceChange}
                        value={source}
                        renderInput={(params) => <TextField color='warning' {...params} label="source" />}
                    />

                    <Autocomplete
                        className='side-panel-text'
                        disablePortal
                        id="side-panel-destination-box"
                        options={allStations}
                        sx={{ height: 60 }}
                        onChange={handleDestinationChange}
                        value={destination}
                        renderInput={(params) => <TextField color='warning' {...params} label="destination" />}
                    />

                    <Button id='findButton' variant="contained" onClick={getOptions}>
                        <SearchIcon />
                    </Button>
                </div>
                {options.map((option, index) => {
                    return (
                        <OptionCard
                            key={index}
                            numOfChanges={option.length}
                            buses={option.map((element) => ({
                                source: element.source,
                                destination: element.destination,
                                buses: element.buses
                            }))}
                        />
                    );
                })}
            </div>
        </>
    )
}

export default SidePanel;