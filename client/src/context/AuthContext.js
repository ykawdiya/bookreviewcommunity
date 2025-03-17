import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    // Token expired
                    localStorage.removeItem('token');
                    console.log('Token expired, please login again');
                }
            } catch (error) {
                // Invalid token
                localStorage.removeItem('token');
                console.error('Invalid token', error);
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        try {
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch (error) {
            console.error('Error during login:', error);
            localStorage.removeItem('token');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/'); // Redirect to home page instead of non-existent /login
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};