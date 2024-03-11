import { Autocomplete, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import allStations from '../stations';

function StationAutocomplete() {
    <div className="station-with-plus">
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
        <AddIcon/>
    </div>
}

export default StationAutocomplete;