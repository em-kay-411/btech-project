import FootPanel from './FootPanel'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import { BusesProvider } from './BusesToTrackContext'
import { useState } from 'react'

function Dashboard () {
    const [emergency, setEmergency] = useState({});

    return (
        <BusesProvider>
            <FootPanel/>
            <LeftPanel emergency={emergency} setEmergency={setEmergency}/>
            <RightPanel emergency={emergency} setEmergency={setEmergency}/>
        </BusesProvider>
    )    
}

export default Dashboard;