import React from 'react';
import { Link } from 'react-router-dom';
import NavLinks from './NavLinks';

function Header() {
    return (
        <header className="p-4 bg-gray-800 text-white">
            <nav className="flex justify-between" aria-label="Main navigation">
                <Link to="/" className="text-lg font-bold">Book Community</Link>
                <NavLinks />
            </nav>
        </header>
    );
}

export default Header;