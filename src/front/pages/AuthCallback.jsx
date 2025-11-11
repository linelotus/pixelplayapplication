import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthTokens, setUserData } from '../utils/auth';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const accessToken = searchParams.get('access_token');
                const refreshToken = searchParams.get('refresh_token');
                const errorParam = searchParams.get('error');

                console.log('🔐 Google OAuth Callback received:', {
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken,
                    error: errorParam,
                    url: window.location.href
                });

                if (errorParam) {
                    console.error('❌ OAuth error:', errorParam);
                    setStatus('error');
                    setError(errorParam);
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (!accessToken) {
                    console.error('❌ No access token in URL');
                    setStatus('error');
                    setError('No authentication token received');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                console.log('💾 Storing authentication tokens...');

                // Store tokens using the updated setAuthTokens function
                // This now saves with MULTIPLE key names for compatibility!
                setAuthTokens(accessToken, refreshToken, true);

                // Verify tokens were saved
                const savedToken = localStorage.getItem('userToken') ||
                    localStorage.getItem('pixelplay_token') ||
                    localStorage.getItem('access_token');

                if (savedToken) {
                    console.log('✅ Tokens stored successfully!');
                    console.log('📦 Token keys in storage:', Object.keys(localStorage).filter(k => k.includes('token')));

                    const backendUrl = import.meta.env.VITE_BACKEND_URL ||
                        'https://stunning-palm-tree-g4p7v5x9wwqj2wqvr-3001.app.github.dev';

                    // STEP 1: Test if the token works with the test endpoint
                    console.log('🧪 Testing token validity...');
                    try {
                        const testResponse = await fetch(`${backendUrl}/api/auth/test-token`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        console.log('🧪 Test token response status:', testResponse.status);

                        if (testResponse.ok) {
                            const testData = await testResponse.json();
                            console.log('✅ Token is valid!', testData);
                        } else {
                            const errorText = await testResponse.text();
                            console.error('❌ Token test failed:', testResponse.status, errorText);
                        }
                    } catch (testError) {
                        console.error('❌ Token test error:', testError);
                    }

                    // STEP 2: Try to fetch user profile
                    try {
                        console.log('🔍 Fetching user profile...');
                        console.log('🔑 Using token:', accessToken.substring(0, 20) + '...');

                        const response = await fetch(`${backendUrl}/api/auth/profile`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        console.log('📡 Profile response status:', response.status);
                        console.log('📡 Profile response headers:', Object.fromEntries(response.headers.entries()));

                        if (response.ok) {
                            const data = await response.json();
                            console.log('✅ User profile loaded:', data.profile);

                            if (data.profile) {
                                setUserData(data.profile);
                            }

                            setStatus('success');
                            setTimeout(() => {
                                console.log('🏠 Navigating to home...');
                                navigate('/home');
                            }, 1500);
                        } else {
                            const errorData = await response.text();
                            console.warn('⚠️ Profile fetch failed:', response.status, errorData);
                            console.warn('⚠️ But continuing with login anyway');

                            // Continue to home even if profile fetch fails
                            setStatus('success');
                            setTimeout(() => navigate('/home'), 1500);
                        }
                    } catch (fetchError) {
                        console.warn('⚠️ Could not fetch profile, but tokens are saved:', fetchError);

                        // Continue to home even if profile fetch fails
                        setStatus('success');
                        setTimeout(() => navigate('/home'), 1500);
                    }
                } else {
                    throw new Error('Failed to save tokens to localStorage');
                }

            } catch (err) {
                console.error('❌ Callback handling error:', err);
                setStatus('error');
                setError(err.message || 'Authentication failed');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '3rem',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
            }}>
                {status === 'processing' && (
                    <>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            border: '6px solid #E5E7EB',
                            borderTop: '6px solid #8B5CF6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1F2937',
                            margin: '0 0 0.5rem 0'
                        }}>
                            Completing Sign In...
                        </h2>
                        <p style={{
                            color: '#6B7280',
                            margin: 0,
                            fontSize: '0.95rem'
                        }}>
                            Securing your session with Google
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            color: 'white'
                        }}>
                            ✓
                        </div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1F2937',
                            margin: '0 0 0.5rem 0'
                        }}>
                            Welcome to PixelPlay!
                        </h2>
                        <p style={{
                            color: '#6B7280',
                            margin: 0,
                            fontSize: '0.95rem'
                        }}>
                            Taking you to your dashboard...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            color: 'white'
                        }}>
                            ✕
                        </div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1F2937',
                            margin: '0 0 0.5rem 0'
                        }}>
                            Authentication Failed
                        </h2>
                        <p style={{
                            color: '#6B7280',
                            margin: '0 0 1rem 0',
                            fontSize: '0.95rem'
                        }}>
                            {error || 'Something went wrong'}
                        </p>
                        <p style={{
                            color: '#9CA3AF',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            Redirecting to login page...
                        </p>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AuthCallback;