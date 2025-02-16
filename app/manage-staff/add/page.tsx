'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/app/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const formSchema = z.object({
  firstName: z.string()
    .nonempty("First name is required")
    .min(2, "First name must be at least 2 characters long"),
  lastName: z.string()
    .nonempty("Last name is required")
    .min(2, "Last name must be at least 2 characters long"),
  email: z.string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  address: z.string()
    .nonempty("Address is required")
    .min(5, "Address must be at least 5 characters long"),
  dateJoined: z.string().nonempty("Date joined is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddStaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const staffRole = "STAFF";

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });


  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`/api/manage-staff?id=${id}`);
          if (!response.ok) throw new Error('Failed to fetch user data');
          const data = await response.json();

          setValue("firstName", data.firstName || '');
          setValue("lastName", data.lastName || '');
          setValue("email", data.email || '');
          setValue("address", data.address || '');
          setValue("dateJoined", new Date(data.dateJoined).toISOString().split('T')[0]);

        } catch (error) {
          toast.error('Error fetching staff data');
        }
      };
      fetchUserData();
    }
  }, [id, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {

    const method = id ? 'PUT' : 'POST';
    const userData = id ? { ...data, id } : {
      ...data,
      role: staffRole
    };
    const response = await fetch(`/api/manage-staff${id ? `?id=${id}` : ''}`, {

      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      toast.error(responseData.error || 'An error occurred');
    } else {
      toast.success(id ? 'Staff member updated successfully!' : 'Staff member created successfully!');
      router.push('/manage-staff');
    }
  };

  return (
    <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-base-content mb-6">{id ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">First Name</span>
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  className={`input input-bordered w-full bg-base-100 text-base-content ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.firstName.message}</span>
                  </label>
                )}
              </div>

              {/* Last Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Last Name</span>
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.lastName.message}</span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  required
                  className={`input input-bordered w-full bg-base-100 text-base-content ${id ? 'read-only' : ''}`}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email.message}</span>
                  </label>
                )}
              </div>

              {/* Password */}
              {!id && (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-base-content">Password</span>
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    className="input input-bordered w-full bg-base-100 text-base-content"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.password.message}</span>
                    </label>
                  )}
                </div>
              )}

              {/* Date Joined */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Date Joined</span>
                </label>
                <input
                  type="date"
                  {...register("dateJoined")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter date joined"
                />
                {errors.dateJoined && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.dateJoined.message}</span>
                  </label>
                )}
              </div>

              {/* Address */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Address</span>
                </label>
                <textarea
                  {...register("address")}
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content h-24"
                  placeholder="Enter address"
                />
                {errors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.address.message}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="error"
                outline
                onClick={() => router.push('/manage-staff')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                outline
              >
                {id ? 'Update Staff' : 'Add Staff'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}