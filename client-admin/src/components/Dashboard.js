import FootPanel from './FootPanel'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import { BusesProvider } from './BusesToTrackContext'

function Dashboard () {
    return (
        <BusesProvider>
            <FootPanel/>
            <LeftPanel/>
            <RightPanel/>
        </BusesProvider>
    )    
}

export default Dashboard;