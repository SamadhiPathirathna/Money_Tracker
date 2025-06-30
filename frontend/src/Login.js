import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ setUser }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const res = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      alert('Google login failed: ' + err.message);
    }
  };

  const handleError = () => {
    alert('Google Login Failed');
  };

  return (
    <main style={{ maxWidth: 400, margin: 'auto', padding: 20, textAlign: 'center', color: '#ddd' }}>
      <h1>Sign in with Google</h1>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      <p style={{ marginTop: 20, fontSize: 14 }}>You must sign in to access your dashboard.</p>
    </main>
  );
}
