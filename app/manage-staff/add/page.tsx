'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import debounce from 'lodash/debounce';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';

interface FormData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
}

interface Message {
  type: 'success' | 'error' | '';
  content: string;
}

export default function AddStaffPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
  });

  const [emailStatus, setEmailStatus] = useState<'available' | 'unavailable' | ''>('');
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'unavailable' | ''>('');
  const [message, setMessage] = useState<Message>({ type: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Debounced email check
  const checkEmail = debounce(async (email: string) => {
    if (!email) return setEmailStatus('');

    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const exists = await response.json();
      setEmailStatus(exists ? 'unavailable' : 'available');
    } catch (error) {
      console.error('Error checking email:', error);
    }
  }, 500);

  // Debounced username check
  const checkUsername = debounce(async (username: string) => {
    if (!username) return setUsernameStatus('');

    try {
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const exists = await response.json();
      setUsernameStatus(exists ? 'unavailable' : 'available');
    } catch (error) {
      console.error('Error checking username:', error);
    }
  }, 500);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', content: 'Staff member added successfully!' });
        setFormData({
          email: '',
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          address: '',
        });
        setEmailStatus('');
        setUsernameStatus('');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', content: data.error || 'Failed to add staff member.' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Add New Staff</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="form-control">
            <label className="label">First Name</label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Last Name</label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Username</label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Password</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-control col-span-2">
            <label className="label">Address</label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-control col-span-2 flex justify-end">
            <Button type="submit" className="w-full bg-[#D2E057] text-gray-700 py-2 px-4 rounded-lg hover:bg-[#c8d652] focus:outline-none focus:ring-2 focus:ring-[#D2E057]" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
        {message.content && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mt-4">
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}