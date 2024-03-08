import '../css/Map.css'

function Map(props) {
    const visibility = props.visibility;
    const positionX = props.positionX;

    return (
      <div className={`map ${visibility ? 'visible' : 'hidden'}`} id='map' style={{ transform: `translate(${positionX}%, 0%)` }}>
        Map
      </div>
    );
  }
  

export default Map;