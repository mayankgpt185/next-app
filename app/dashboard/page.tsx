'use client';

import React, { useState } from 'react';
import LoginPage from '../login/page';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar/sidebar';

export default function SignUpPage() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Sidebar />
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Mayank Free forever.
                </p>

                <div className="space-y-4">
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                        />
                        Sign up with Google
                    </button>

                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <img
                            src="https://www.apple.com/favicon.ico"
                            alt="Apple"
                            className="w-5 h-5 mr-2"
                        />
                        Sign up with Apple
                    </button>
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Your Name
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Your E-mail
                        </label>
                        <input
                            type="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            required
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            I agree to all the <a href="#" className="text-blue-600">Term</a>,{' '}
                            <a href="#" className="text-blue-600">Privacy Policy</a> and{' '}
                            <a href="#" className="text-blue-600">Fees</a>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Continue
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:text-blue-500">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}