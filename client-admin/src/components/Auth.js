import '../css/Auth.css'
import { useState } from 'react';
import { TextField, Button, Snackbar, Link } from '@mui/material';
import { Route } from 'react-router-dom';
import env from 'react-dotenv'
import axios from 'axios';

function Auth() {
    const backendURL = env.BACKEND_API_URL;
    const [mobileNumber, setMobileNumber] = useState('');
    const [status, setStatus] = useState('dormant');
    const [message, setMessage] = useState('');
    const [otp, setOTP] = useState('');
    const [open, setOpen] = useState(false);

    const handleMobileNumberChange = (event) => {
        setMobileNumber(event.target.value);
    }

    const handleOTPChange = (event) => {
        setOTP(event.target.value);
    }

    const handleClose = (event, reason) => {

        setOpen(false);
    }

    const beginVerification = async () => {
        if (mobileNumber < 10) {
            setMessage('Invalid mobile number');
            setOpen(true);
            return;
        }
        const mobileNoString = '+91' + mobileNumber;
        const requestBody = {
            mobileNo: mobileNoString
        }

        const response = await axios.post(`${backendURL}/auth`, requestBody);

        response.status === 200 ? setStatus('pending') : setStatus('dormant');
        setMessage(response.message);
    }

    const verificationCheck = async () => {
        const mobileNoString = '+91' + mobileNumber;
        const requestBody = {
            mobileNo: mobileNoString,
            code: otp
        }

        const response = await axios.post(`${backendURL}/verifyOTP`, requestBody);
        response.status === 200 ? setStatus('done') : setStatus('pending');
        setMessage(response.message);
    }

    return (
        <>
            {status !== 'done' && (<div className="auth-container">
                <TextField
                    className='mobile-number'
                    color='warning'
                    label='enter mobile number'
                    onChange={handleMobileNumberChange}
                    value={mobileNumber}
                />
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={handleClose}
                    message={message}
                />
                {status === 'pending' && (
                    <TextField
                        className='otp-area'
                        color='warning'
                        label='enter otp'
                        onChange={handleOTPChange}
                        value={otp}
                    />
                )}
                <Link onClick={beginVerification}>Didn't receive OTP? Resend</Link>
                {status === 'dormant' && (
                    <Button id='findButton' variant="contained" onClick={beginVerification}>
                        Get OTP
                    </Button>
                )}
                {status === 'pending' && (
                    <Button id='findButton' variant="contained" onClick={verificationCheck}>
                        Verify
                    </Button>
                )}
            </div>)}

        </>
    );
}

export default Auth;