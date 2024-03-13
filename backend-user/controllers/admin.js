const dotenv = require('dotenv');
dotenv.config();
const twilio = require('twilio');
const crypto = require('crypto')
const TWILIO_ACCOUNT_AUTH_TOKEN = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_SID;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_ACCOUNT_AUTH_TOKEN);

const users = [];

const verifyAdmin = async (req, res) => {
    const mobileNo = req.body.mobileNo;
    try{
        client.verify.v2.services(TWILIO_SERVICE_ID)
        .verifications
        .create({ to: mobileNo, channel: 'sms' });

        res.status(200).json({message : 'OTP has been sent to the mobile number'});
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
}

const verificationCheck = async(req, res) => {
    const code = req.body.code;
    const mobileNo = req.body.mobileNo;

    try{
        client.verify.v2.services(TWILIO_SERVICE_ID)
            .verificationChecks
            .create({to: mobileNo, code: code})
            .then(verification_check => console.log(verification_check.status));
        
        const cookie = crypto.createHash('md5').update(mobileNo).digest('hex');
        console.log(cookie);
        users.push(cookie);
        res.status(200).json({cookie : cookie, message : 'Successful authentication'});
        
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
   
}

// For every new route, send mobile no or hash it to a cookie with every request as it serves authentication

module.exports = {
    verifyAdmin,
    verificationCheck
}