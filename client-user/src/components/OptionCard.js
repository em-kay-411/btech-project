import '../css/OptionCard.css'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

function OptionCard(props) {
    const stations = props.buses;
    const numOfChanges = props.numOfChanges;

    return (
        <div className="option-card">
            <div className="bus-info">
                <DirectionsBusIcon className='bus-icon' style={{fontSize : 60}} />
                <div className="changes-count">
                    {numOfChanges} bus(s) to change
                </div>
            </div>
            {stations.map((transit, index) => {
                console.log(transit.buses);
                return (
                    <div key={index} className="transit-card">
                        <div className="buses-to-display">{transit.buses.map((element, i) => { return (<div key={i} className='bus-number'>{element.id}</div>) })}</div>
                        <div className="source-name">{transit.source}</div>
                        <div className="destination-name">{transit.destination}</div>
                    </div>
                )

            })}
        </div>
    )
}

export default OptionCard