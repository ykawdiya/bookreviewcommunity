import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoginButton from './LoginButton';

function NavLinks() {
    const { user, login, logout } = useContext(AuthContext);

    return (
        <div className={`flex ${user ? 'space-x-4' : ''}`}>
            {user ? (
                <>
                    <Link to="/profile" className="mr-4">Profile</Link>
                    <button type="button" onClick={logout} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
                        Logout
                    </button>
                </>
            ) : (
                <LoginButton onLogin={login} />
            )}
        </div>
    );
}

export default NavLinks;