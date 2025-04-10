'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { roleAccess } from '@/lib/role';

// Define email form schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

// Define login form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type EmailFormData = z.infer<typeof emailSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  // Email form setup
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  });

  // Password form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handle email submission
  const handleEmailSubmit: SubmitHandler<EmailFormData> = (data) => {
    setEmail(data.email);
    loginForm.setValue('email', data.email);
    setShowPassword(true);
  };

  // Handle login submission
  const handleLoginSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log('Login response data:', responseData); // Debug the full response
        
        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
          if (responseData.user?.role) {
            localStorage.setItem('userRole', responseData.user.role);
          }
          if (responseData.user?.email) {
            localStorage.setItem('userEmail', responseData.user.email);
            
            // Fix for name - check all possible name properties
            const userName = responseData.user.name || 
                            (responseData.user.firstName && responseData.user.lastName ? 
                             `${responseData.user.firstName} ${responseData.user.lastName}` : 
                             responseData.user.firstName || responseData.user.lastName || 'User');
            
            console.log('Setting user name:', userName);
            localStorage.setItem('name', userName);
          }
        }
        
        // Get user role, handling potential document structure issues
        const userRole = responseData.user?.role || 
                         responseData.user?._doc?.role ||
                         responseData.user?.toJSON?.()?.role;
        
        // Find the first route the user has access to based on their role
        const userRoleRoutes = roleAccess.find(access => access.role === userRole);
        
        if (userRoleRoutes && userRoleRoutes.routes.length > 0) {
          // Redirect to the first route they have access to
          console.log('User role routes:', userRoleRoutes);
          router.push(userRoleRoutes.routes[0]);
        } else {
          console.log('fallback');
          // Fallback in case role matching fails
          router.push('/manage-staff');
        }
        
        router.refresh(); // Refresh the current route to update the auth state
      } else {
        const responseData = await res.json();
        setError(responseData.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card bg-base-200 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-base-content mb-6 text-center w-full">
            {showPassword ? 'Enter password' : 'Sign in or create an account'}
          </h1>
          <p className="text-sm text-base-content/70 mb-6 text-center">
            CMS is here!
          </p>

          {error && (
            <div className="text-sm text-error bg-error/10 border border-error/20 rounded-md p-2.5 mb-4">
              {error}
            </div>
          )}

          {!showPassword ? (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4" noValidate>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Email</span>
                </label>
                <input
                  type="email"
                  {...emailForm.register("email")}
                  className={`input input-bordered w-full bg-base-100 text-base-content ${emailForm.formState.errors.email ? 'input-error' : ''}`}
                  placeholder="Your E-mail"
                />
                {emailForm.formState.errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{emailForm.formState.errors.email.message}</span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4" noValidate>
              <div className="flex items-center gap-2 text-base-content mb-4 p-2 bg-base-100 rounded-lg">
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(false)}
                  className="ml-auto text-sm text-primary hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    {...loginForm.register("password")}
                    className={`input input-bordered w-full bg-base-100 text-base-content pr-10 ${loginForm.formState.errors.password ? 'input-error' : ''}`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{loginForm.formState.errors.password.message}</span>
                  </label>
                )}
                <label className="label">
                  <a href="#" className="label-text-alt link link-primary">Forgot password?</a>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Sign in
              </button>
            </form>
          )}

          <div className="divider text-xs text-base-content/70">OR</div>

          <button className="btn btn-outline w-full">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-base-content/70">
            Don't have an account?
            <a href="/signup" className="text-primary ml-1 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}