import '../css/Form.css'
import { Autocomplete, TextField, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import allStations from '../stations'

function Form(props){
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const visibility = props.visibility;
    const positionX = props.positionX;
    const positionY = props.positionY;

    return (
    <div className={`form ${visibility ? 'visible' : 'hidden'}`} id="form" style={{transform : `translate(${positionX}%, ${positionY}%)`}}>
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
    )
}

export default Form;