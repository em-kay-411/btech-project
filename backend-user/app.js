const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { findOptionsPOSTReq } = require('./controllers/user');
const { verifyAdmin, verificationCheck, addBus, getRouteForBus } = require('./controllers/admin');
const mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv.config();

const BACKEND_USER_PORT = process.env.BACKEND_USER_PORT || 3050;
// const TWILIO_ACCOUNT_AUTH_TOKEN = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
// const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID;
// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_ACCOUNT_AUTH_TOKEN);

mongoose.connect('mongodb://localhost:27017/btech-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.post('/', findOptionsPOSTReq);
app.post('/auth', verifyAdmin);
app.post('/verifyOTP', verificationCheck);
app.post('/addBus', addBus);
app.get('/busRoute', getRouteForBus);

app.listen(BACKEND_USER_PORT, () => {
    console.log(`The Backend for user is running on ${BACKEND_USER_PORT}`);
})