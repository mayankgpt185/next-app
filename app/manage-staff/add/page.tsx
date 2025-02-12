'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ManageStaffPage from '../page';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  role: z.string().min(1, "Role must be at least 1 character"),
});

type FormData = z.infer<typeof formSchema>;

interface Role {
  _id: string;
  role_name: string;
}

export default function AddStaffPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/role');
        if (!response.ok) throw new Error('Failed to fetch roles');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-base-content mb-6">Add New Staff Member</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              {/* <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Role</span>
                </label>
                <select
                  {...register("role")}
                  className="select select-bordered w-full bg-base-100 text-base-content"
                  defaultValue=""
                >
                  <option value="" disabled>Select a role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.role.message}</span>
                  </label>
                )}
              </div> */}
              {/* First Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">First Name</span>
                </label>
                <input
                  type="text"
                  {...register("firstname")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter first name"
                />
                {errors.firstname && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.firstname.message}</span>
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
                  {...register("lastname")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter last name"
                />
                {errors.lastname && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.lastname.message}</span>
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
                  {...register("email")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email.message}</span>
                  </label>
                )}
              </div>

              {/* Password */}
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

              {/* Address */}
              <div className="form-control w-full md:col-span-2">
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
              <Button variant="error" outline onClick={() => router.push('/manage-staff')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" outline>
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* <div className="divider"></div>
      <ManageStaffPage /> */}
    </div>
  );
}