import '../css/FootPanel.css'
import { TextField } from '@mui/material';
import { useState } from 'react';
import RouteArray from './RouteArray';
import CookieContext from '../CookieContext';
import { useContext } from 'react';

function FootPanel() {

    const [bus, setBus] = useState('');
    const {cookie, setCookie} = useContext(CookieContext);

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