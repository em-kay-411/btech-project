import '../css/SidePanel.css'
import { useState } from 'react';
import { Autocomplete, TextField, Button } from '@mui/material';
import '../css/DetailedOptionCard.css'
import SearchIcon from '@mui/icons-material/Search';
import DetailedOptionCard from './DetailedOptionCard';
import allStations from '../stations'
import OptionCard from './OptionCard';
import axios from 'axios';
import Spinner from './Spinner';
import env from "react-dotenv";

function SidePanel() {
    const backendURL = env.BACKEND_API_URL;
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [detailedOptionCard, setDetailedOptionCard] = useState([]);

    const getOptions = async () => {
        // console.log(source, destination)
        setLoading(true);
        setOptions([]);
        const requestBody = {
            source: source,
            destination: destination
        }

        try {
            const response = await axios.post(backendURL, requestBody);
            setOptions(response.data.options);
            setLoading(false);
        }
        catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const handleSourceChange = (event, value) => {
        setSource(value);
    }

    const handleDestinationChange = (event, value) => {
        setDestination(value);
    }

    const handleOptionCardClick = (option) => {
        // console.log(option);
        setDetailedOptionCard(option);
        // console.log('detailedOptionCard')
    }


    return (
        <>
            <div className='side-panel' id="side-panel">
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
                        <SearchIcon /> find buses
                    </Button>

                    <Button id='findButton' variant="contained">
                        search nearby buses
                    </Button>
                </div>
                {/* <div className="loading-spinner"> */}
                {loading && (<Spinner />)}
                {/* </div>             */}
                <div className="options">
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
                                onClick={() => handleOptionCardClick(option)}
                            />
                        );
                    })}
                </div>
            </div>
            {(detailedOptionCard.length > 0) && <DetailedOptionCard option={detailedOptionCard} setDetailedOptionCard={setDetailedOptionCard}/>}
        </>
    )
}

export default SidePanel;