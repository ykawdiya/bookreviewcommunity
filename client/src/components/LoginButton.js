import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

function LoginButton({ onLogin }) {
    const [error, setError] = useState(null);

    const onSuccess = async (response) => {
        try {
            setError(null);
            const res = await axios.post(`${API_URL}/api/auth/google`, {
                token: response.credential,
            });

            if (res.data && res.data.token) {
                onLogin(res.data.token);
            } else {
                console.error("Invalid response from server", res.data);
                setError("Authentication failed. Please try again.");
            }
        } catch (error) {
            console.error('Login failed', error);
            setError(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    const onError = () => {
        console.error("Google login failed");
        setError("Google login failed. Please try again.");
    };

    return (
        <div>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                useOneTap
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

export default LoginButton;