import '../css/Form.css'
import { Autocomplete, TextField, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import allStations from '../stations'
import SidePanel from './SidePanel';
import axios from 'axios';

function Form(props) {
    const backendURL = 'http://localhost:3050/'
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [options, setOptions] = useState([]);
    const [isSidePanelVisible, setIsSidePanelVisible] = useState(false);
    const [visibility, setIsVisibility] = useState(props.visibility);
    const positionX = props.positionX;

    const getOptions = async () => {
        const requestBody = {
            source: source,
            destination: destination
        }

        try {
            const response = await axios.post(backendURL, requestBody);
            console.log(options);
            setOptions(response.data.options);
            setIsVisibility(false);
            setIsSidePanelVisible(true);
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
            <div className={`form ${visibility ? 'visible' : 'hidden'}`} id="form" style={{ transform: `translate(${positionX}%, 0%)` }}>
                <Autocomplete
                    className='text'
                    disablePortal
                    id="source-box"
                    options={allStations}
                    // sx={{ width: 30% }}
                    sx={{ height: 60 }}
                    onChange={handleSourceChange}
                    value={source}
                    renderInput={(params) => <TextField color='warning' {...params} label="source" />}
                />

                <Autocomplete
                    className='text'
                    disablePortal
                    id="destination-box"
                    options={allStations}
                    sx={{ height: 60 }}
                    onChange={handleDestinationChange}
                    value={destination}
                    renderInput={(params) => <TextField color='warning' {...params} label="destination" />}
                />

                <Button id='findButton' variant="contained" onClick={getOptions}>
                    find buses
                </Button>
            </div>
            <SidePanel visibility={isSidePanelVisible} source={source} destination={destination} options={options}/>
        </>

    )
}

export default Form;