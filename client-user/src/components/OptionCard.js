import '../css/OptionCard.css'
import {useEffect} from 'react';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GpsFixedTwoToneIcon from '@mui/icons-material/GpsFixedTwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';

function OptionCard(props) {
    const stations = props.buses;
    const numOfChanges = props.numOfChanges;
    const onClick = props.onClick;

    return (
        <div className="option-card" onClick={onClick}>
            <div className="bus-info">
                <DirectionsBusIcon className='bus-icon' style={{ fontSize: 60 }} />
                {(numOfChanges - 1 > 0) && (<div className="changes-count">{numOfChanges - 1} bus(s) to change </div>)}
            </div>
            {stations.map((transit, index) => {
                const uniqueBuses = new Set(transit.buses.map(element => element.id));
                return (
                    <div key={index} className="transit-card">
                        <div className="buses-to-display">{Array.from(uniqueBuses).map((busNumber, i) => {                             
                            return (<div key={i} className='bus-number'>{busNumber}</div>) })}
                        </div>
                        <div className="transit-buses">
                            <div className="source-name"> <GpsFixedTwoToneIcon fontSize='small' color='success'/>{transit.source}</div>
                            <div className="destination-name"> <LocationOnTwoToneIcon fontSize='small' color='error'/>{transit.destination}</div>
                        </div>
                    </div>
                )

            })}
        </div>
    )
}

export default OptionCard