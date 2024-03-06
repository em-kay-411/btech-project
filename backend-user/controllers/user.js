const { findOptions } = require('../utils/crud');

const findOptionsPOSTReq = async (req, res) => {
    const source = req.body.source;
    const destination = req.body.destination;

    console.log(source, destination);

    const options = await findOptions(source, destination,);

    res.status(200).json({options});
}

module.exports = {
    findOptionsPOSTReq
}