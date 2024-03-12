import '../css/FootPanel.css'
import { Autocomplete, TextField, Button } from '@mui/material';
import { useState } from 'react';
import RouteArray from './RouteArray';

function FootPanel() {

    const [bus, setBus] = useState('');
    const [route, setRoute] = useState([]);

    const handleBusChange = (event, value) => {
        setBus(value);
    }

    return (
        <div className="foot-panel">
            Update/Add Bus Route

            <TextField
                className='bus-number-text'
                color='warning'
                label='bus number'
                onChange={handleBusChange}
                value={bus}
            />
            
            <RouteArray/>
        </div>
    )
}

export default FootPanel;