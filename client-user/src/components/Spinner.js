import { ThreeCircles } from 'react-loader-spinner';

function Spinner() {
    return (
        <ThreeCircles
            visible={true}
            height="100"
            width="50"
            color="#ffa500"
            ariaLabel="three-circles-loading"
            wrapperStyle={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
            }}
            wrapperClass=""
        />
    )
}

export default Spinner;