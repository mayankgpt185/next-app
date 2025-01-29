'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would validate the email exists in your system
    if (email.includes('@')) {
      setShowPassword(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // alert('Login successful!');
        setEmail('');
        setPassword('');
        
      } else {
        const data = await response.json();
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {showPassword ? 'Enter password' : 'Sign in or create an account'}
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          CMS is here!
        </p>

        {!showPassword ? (
          <>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your E-mail"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#D2E057] text-gray-700 py-2 px-4 rounded-lg hover:bg-[#c8d652] focus:outline-none focus:ring-2 focus:ring-[#D2E057]"
              >
                Continue
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </button>
          </>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600 mb-4 p-2 bg-gray-50 rounded-lg">
              <span>{email}</span>
              <button
                type="button"
                onClick={() => setShowPassword(false)}
                className="ml-auto text-sm text-blue-600 hover:text-blue-500"
              >
                Change
              </button>
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#D2E057] text-gray-700 py-2 px-4 rounded-lg hover:bg-[#c8d652] focus:outline-none focus:ring-2 focus:ring-[#D2E057]"
            >
              Sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <a href="/signup" className="text-blue-600 ml-1 hover:text-blue-500">Sign up</a>
        </p>
      </div>
    </div>
  );
}