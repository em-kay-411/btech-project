const { findOptions } = require('../utils/crud');

const findOptionsPOSTReq = async (req, res) => {
    const source = req.body.source;
    const destination = req.body.destination;

    console.log(source, destination);

    try{
        const options = await findOptions(source, destination,);
        res.status(200).json({options});
    } catch(error){
        res.status(500).json({message : error.message});
    }
    
}

module.exports = {
    findOptionsPOSTReq
}