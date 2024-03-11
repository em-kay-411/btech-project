import '../css/FootPanel.css'
import { Autocomplete, TextField, Button } from '@mui/material';
import { useState } from 'react';
import StationAutocomplete from './StationAutocomplete';

function FootPanel () {

    const [bus, setBus] = useState('');
    const [route, setRoute] = useState([]);

    const handleBusChange = (event, value) => {
        setBus(value);
    }

    return (
        <div className="foot-panel">
            Update/Add Bus Route

            <TextField
                    color='warning'
                    label='location'
                    onChange={handleBusChange}
                    value={bus}
                />
            <StationAutocomplete/>
            <StationAutocomplete/>
        </div>
    )
}

export default FootPanel;