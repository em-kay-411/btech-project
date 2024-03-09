import {ThreeCircles} from 'react-loader-spinner';

function Spinner() {
    return (
        <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#ffa500"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />
    )
}

export default Spinner;