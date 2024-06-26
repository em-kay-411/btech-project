import '../css/LeftPanel.css'
import { Autocomplete, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import BusList from './BusList';

function LeftPanel({emergency, setEmergency}) {    
    const [location, setLocation] = useState('');

    const handleLocationChange = (event, value) => {
        setLocation(event.target.value);
    }

    return (
        <div className="left-panel">
            <div className="location-form">
                <TextField
                    color='warning'
                    label='location'
                    onChange={handleLocationChange}
                    value={location}
                />

                <Button id='findButton' variant="contained">
                    <SearchIcon /> find buses
                </Button>                
            </div>
            <BusList emergency={emergency} setEmergency={setEmergency}/>
        </div>
    )
}

export default LeftPanel;