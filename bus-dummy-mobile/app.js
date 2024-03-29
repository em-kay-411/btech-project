const express = require('express');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const PORT = process.env.FRONTEND_PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(PORT, () => {
    console.log('Frontend started');
})