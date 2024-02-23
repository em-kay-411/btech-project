const mongoose = require('mongoose');
const {insertNewBus, deleteBus} = require('./crud');

const main = async() => {
    await mongoose.connect('mongodb://localhost:27017/btech-project', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const route = ["65d801991c6c94ca37d0a96b", "65d801991c6c94ca37d0a976", "65d801991c6c94ca37d0a972", "65d801991c6c94ca37d0a971"];
    deleteBus('6345');
}

main();