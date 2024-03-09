import '../css/OptionCard.css'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GpsFixedTwoToneIcon from '@mui/icons-material/GpsFixedTwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';
import Divider from '@mui/material/Divider';


function OptionCard(props) {
    const stations = props.buses;
    const numOfChanges = props.numOfChanges;

    return (
        <div className="option-card">
            <div className="bus-info">
                <DirectionsBusIcon className='bus-icon' style={{ fontSize: 60 }} />
                {(numOfChanges - 1 > 0) && (<div className="changes-count">{numOfChanges - 1} bus(s) to change </div>)}
            </div>
            {stations.map((transit, index) => {
                console.log(transit.buses);
                return (
                    <div key={index} className="transit-card">
                        <div className="buses-to-display">{transit.buses.map((element, i) => { return (<div key={i} className='bus-number'>{element.id}</div>) })}</div>
                        <div className="transit-stations">
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