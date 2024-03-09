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
    const [options, setOptions] = useState(([
        [
            {
                "source": "Deccan Gymkhana",
                "destination": "Pune Railway Station",
                "buses": [
                    {
                        "_id": "65dffbb5d1063d9e79a606ab",
                        "id": "8",
                        "route": [
                            "65d801991c6c94ca37d0a999",
                            "65d801991c6c94ca37d0a99d",
                            "65d801991c6c94ca37d0a99e",
                            "65d801991c6c94ca37d0a99f",
                            "65d801991c6c94ca37d0a9a3",
                            "65d801991c6c94ca37d0a9a0",
                            "65d801991c6c94ca37d0a99b",
                            "65d801991c6c94ca37d0a9ca",
                            "65d801991c6c94ca37d0a9c9",
                            "65d801991c6c94ca37d0a99c",
                            "65d801991c6c94ca37d0a995",
                            "65d801991c6c94ca37d0a994",
                            "65d801991c6c94ca37d0a994",
                            "65d801991c6c94ca37d0a993",
                            "65d801991c6c94ca37d0a9cb",
                            "65d801991c6c94ca37d0a9cc",
                            "65d801991c6c94ca37d0a9c7",
                            "65d801991c6c94ca37d0a9c8"
                        ],
                        "__v": 0
                    },
                    {
                        "_id": "65dffbb6d1063d9e79a606d2",
                        "id": "9",
                        "route": [
                            "65d801991c6c94ca37d0a999",
                            "65d801991c6c94ca37d0a99d",
                            "65d801991c6c94ca37d0a99e",
                            "65d801991c6c94ca37d0a9cd",
                            "65d801991c6c94ca37d0a9cf",
                            "65d801991c6c94ca37d0a9d0",
                            "65d801991c6c94ca37d0a9d1",
                            "65d801991c6c94ca37d0a9d8",
                            "65d801991c6c94ca37d0a9b9",
                            "65d801991c6c94ca37d0a9ba",
                            "65d801991c6c94ca37d0a9c1",
                            "65d801991c6c94ca37d0a9bc",
                            "65d801991c6c94ca37d0a9c5",
                            "65d801991c6c94ca37d0a9a1",
                            "65d801991c6c94ca37d0a9c7",
                            "65d801991c6c94ca37d0a9c8"
                        ],
                        "__v": 0
                    },
                    {
                        "_id": "65dffbd6d1063d9e79a62b5e",
                        "id": "86",
                        "route": [
                            "65d801991c6c94ca37d0a999",
                            "65d801991c6c94ca37d0a99d",
                            "65d801991c6c94ca37d0a99e",
                            "65d801991c6c94ca37d0a99f",
                            "65d801991c6c94ca37d0a9a3",
                            "65d801991c6c94ca37d0a96c",
                            "65d801991c6c94ca37d0a98b",
                            "65d801991c6c94ca37d0ab80",
                            "65d801991c6c94ca37d0aabf",
                            "65d801991c6c94ca37d0a9c8",
                            "65d801991c6c94ca37d0ad28",
                            "65d801991c6c94ca37d0ac0c",
                            "65d801991c6c94ca37d0ac0a",
                            "65d801991c6c94ca37d0ac0b",
                            "65d801991c6c94ca37d0ad23",
                            "65d801991c6c94ca37d0ad71",
                            "65d801991c6c94ca37d0ad22",
                            "65d801991c6c94ca37d0ad26",
                            "65d801991c6c94ca37d0ad25",
                            "65d801991c6c94ca37d0ad2a",
                            "65d801991c6c94ca37d0ad2e",
                            "65d801991c6c94ca37d0ad2c",
                            "65d801991c6c94ca37d0ad30",
                            "65d801991c6c94ca37d0ad32",
                            "65d801991c6c94ca37d0ad33",
                            "65d801991c6c94ca37d0ad31",
                            "65d801991c6c94ca37d0aba1",
                            "65d801991c6c94ca37d0ad3c",
                            "65d801991c6c94ca37d0ad36",
                            "65d801991c6c94ca37d0ad35",
                            "65d801991c6c94ca37d0ad34",
                            "65d801991c6c94ca37d0ad39",
                            "65d801991c6c94ca37d0ad37",
                            "65d801991c6c94ca37d0ad38",
                            "65d801991c6c94ca37d0ad3a",
                            "65d801991c6c94ca37d0ad3b",
                            "65d801991c6c94ca37d0ad42",
                            "65d801991c6c94ca37d0ad45",
                            "65d801991c6c94ca37d0ad3f",
                            "65d801991c6c94ca37d0ad3d",
                            "65d801991c6c94ca37d0ad3e",
                            "65d801991c6c94ca37d0ad40",
                            "65d801991c6c94ca37d0ad41",
                            "65d801991c6c94ca37d0ad4d",
                            "65d801991c6c94ca37d0ad43",
                            "65d801991c6c94ca37d0ad44",
                            "65d801991c6c94ca37d0ab06",
                            "65d801991c6c94ca37d0ab07",
                            "65d801991c6c94ca37d0ab08",
                            "65d801991c6c94ca37d0ab09",
                            "65d801991c6c94ca37d0ab0c",
                            "65d801991c6c94ca37d0ad46",
                            "65d801991c6c94ca37d0ad47",
                            "65d801991c6c94ca37d0ad4b",
                            "65d801991c6c94ca37d0adf8",
                            "65d801991c6c94ca37d0adf9",
                            "65d801991c6c94ca37d0adfa",
                            "65d801991c6c94ca37d0adfe",
                            "65d801991c6c94ca37d0adfc",
                            "65d801991c6c94ca37d0adfd",
                            "65d801991c6c94ca37d0adff",
                            "65d801991c6c94ca37d0ae00",
                            "65d801991c6c94ca37d0ae09",
                            "65d801991c6c94ca37d0ae02",
                            "65d801991c6c94ca37d0ae03",
                            "65d801991c6c94ca37d0ae05",
                            "65d801991c6c94ca37d0ae04",
                            "65d801991c6c94ca37d0ad9c"
                        ],
                        "__v": 0
                    },
                    {
                        "_id": "65dffbded1063d9e79a62f8d",
                        "id": "98",
                        "route": [
                            "65d801991c6c94ca37d0a999",
                            "65d801991c6c94ca37d0a99d",
                            "65d801991c6c94ca37d0a99e",
                            "65d801991c6c94ca37d0a99f",
                            "65d801991c6c94ca37d0a9a3",
                            "65d801991c6c94ca37d0a96c",
                            "65d801991c6c94ca37d0a98b",
                            "65d801991c6c94ca37d0a971",
                            "65d801991c6c94ca37d0ab80",
                            "65d801991c6c94ca37d0aabf",
                            "65d801991c6c94ca37d0a9c8",
                            "65d801991c6c94ca37d0ac9f",
                            "65d801991c6c94ca37d0ac0c",
                            "65d801991c6c94ca37d0ac0a",
                            "65d801991c6c94ca37d0ac0b",
                            "65d801991c6c94ca37d0ac09",
                            "65d801991c6c94ca37d0ac08",
                            "65d801991c6c94ca37d0ac07",
                            "65d801991c6c94ca37d0ac06",
                            "65d801991c6c94ca37d0ac05",
                            "65d801991c6c94ca37d0ac04",
                            "65d801991c6c94ca37d0ac03",
                            "65d801991c6c94ca37d0ac02",
                            "65d801991c6c94ca37d0ac01",
                            "65d801991c6c94ca37d0ac00",
                            "65d801991c6c94ca37d0abff",
                            "65d801991c6c94ca37d0abfe",
                            "65d801991c6c94ca37d0abfd",
                            "65d801991c6c94ca37d0abfb"
                        ],
                        "__v": 0
                    }
                ]
            }
        ]
    ]));

    const getOptions = async () => {
        const requestBody = {
            source: source,
            destination: destination
        }

        try {
            const options = await axios.post(backendURL, requestBody);
            console.log(options);
            setOptions(options);
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
            <div id="side-panel">
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