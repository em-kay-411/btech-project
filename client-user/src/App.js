import './App.css';
import { Autocomplete, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import allStations from './stations'

function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div className="App">
      <div className="form" id="form">
        <Autocomplete
          className='text'
          disablePortal
          id="source-box"
          options={allStations}
          // sx={{ width: 30% }}
          sx={{height: 60}}
          renderInput={(params) => <TextField color='warning' {...params} label="source" onChange={(event) =>setSource(event.target.value) } />}
        />

        <Autocomplete
          className='text'
          disablePortal
          id="destination-box"
          options={allStations}
          sx={{height: 60}}
          renderInput={(params) => <TextField color='warning' {...params} label="destination" onChange={(event) =>setDestination(event.target.value) } />}
        />

        <Button id='findButton' variant="contained">
          find buses
        </Button>
      </div>

    </div>
  );
}

export default App;
