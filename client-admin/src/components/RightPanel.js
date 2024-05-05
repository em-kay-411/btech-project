import '../css/RightPanel.css'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CarCrashIcon from '@mui/icons-material/CarCrash';
import {Button } from '@mui/material';

function RightPanel({ emergency }) {
    const handleAddressed = () => {
        // to be erittwn
    }

    return (
        <div className="right-panel">
            {Object.keys(emergency).map((busID) => {
                return (
                    <div className="emergency-card">
                        <div className="warning-logo">{emergency[busID].typeOfEmergency === 'FireAndAccident' && <><LocalFireDepartmentIcon /> <CarCrashIcon /> </>}
                            {emergency[busID].typeOfEmergency === 'fire' && <LocalFireDepartmentIcon />}
                            {emergency[busID].typeOfEmergency === 'accident' && <CarCrashIcon />}</div>
                        <div className="info">
                            <div className="busid">{busID}</div>
                            <div className="type-info">
                                <div className="type">{emergency[busID].typeOfEmergency}</div>
                                <Button className='addressed' onClick={() => handleAddressed(busID)}>Addressed</Button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default RightPanel;