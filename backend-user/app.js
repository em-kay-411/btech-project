const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { findOptionsPOSTReq } = require('./controllers/user');
const mongoose = require('mongoose');
const BACKEND_USER_PORT = process.env.BACKEND_USER_PORT || 3050;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv.config();

mongoose.connect('mongodb://localhost:27017/btech-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.post('/', findOptionsPOSTReq);

app.listen(BACKEND_USER_PORT, () => {
    console.log(`The Backend for user is running on ${BACKEND_USER_PORT}`);
})