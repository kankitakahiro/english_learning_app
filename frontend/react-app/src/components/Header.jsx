import React from 'react';

export default function Header({ imgUrl }) {
    return (
        <header>
            <img src={imgUrl} alt="logo" className='header-img' />
        </header>
    );
}