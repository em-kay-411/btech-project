import '../css/BusDetails.css'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

function BusDetails(props) {
    return (
        <div className="bus-details">
            <div className="bus-details-id">{props.busID}</div>
            <div className="actual-details">
                <div className="bus-details-station-info">
                    <div className="crossed">Crossed {props.previousStation.name}</div>
                    <div className="current-location">
                        Near ({props.latitude}, {props.longitude})
                    </div>
                    <div className="next">Arriving at {props.nextStation.name} in {props.eta} mins</div>
                </div>
                <div className="bus-details-route">
                    {props.route.map((station) => {
                        return (
                            <div className="station-element">
                                <div className="symbol">{station.crossed ? <RadioButtonCheckedIcon fontSize='small' style={{color: '#9d9dff'}}/> : <RadioButtonUncheckedIcon fontSize='small' style={{color: '#9d9dff'}} />}</div>
                                <div className="station-name">{station.name}</div>
                            </div> 
                            
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default BusDetails;