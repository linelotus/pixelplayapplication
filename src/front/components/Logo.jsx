// --- src/components/Logo.jsx ---
// Reusable SVG Logo Component

import React from 'react';

const Logo = ({ width = 120, height = 120 }) => (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
        </defs>
        <rect x="10" y="10" width="15" height="80" fill="url(#logoGradient)" rx="5"/>
        <rect x="25" y="10" width="35" height="15" fill="url(#logoGradient)" rx="5"/>
        <rect x="60" y="25" width="15" height="25" fill="url(#logoGradient)" rx="5"/>
        <rect x="25" y="50" width="35" height="15" fill="url(#logoGradient)" rx="5"/>
        <path d="M 60 65 L 60 95 L 85 80 Z" fill="#f43f5e" />
    </svg>
);
export default Logo;