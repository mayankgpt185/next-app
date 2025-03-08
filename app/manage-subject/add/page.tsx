'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/app/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { set } from 'lodash';
import { Loader2 } from 'lucide-react';

// Define types for class and section
interface Course {
    _id: string;
    name: string;
    class: {
        classNumber: number;
        _id: string;
    };
}

interface Staff {
    _id: string;
    firstName: string;
    lastName: string;
}

const formSchema = (isUpdate: boolean) => z.object({
    subject: z.string()
        .nonempty("Subject name is required")
        .min(2, "Subject name must be at least 2 characters long"),
    courseId: z.string().nonempty("Course is required"),
    staffId: z.string().nonempty("Staff is required"),
    academicStartYear: z.string()
        .nonempty("Academic start year is required")
        .refine(date => !isNaN(Date.parse(date)), {
            message: "Invalid date format"
        }),
    academicEndYear: z.string()
        .nonempty("Academic end year is required")
        .refine(date => !isNaN(Date.parse(date)), {
            message: "Invalid date format"
        })
        .refine(date => !isNaN(Date.parse(date)), {
            message: "Invalid date format"
        })
});

type FormData = z.infer<ReturnType<typeof formSchema>>;

export default function AddSubjectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isUpdate = !!id; // If `id` exists, it's an update, otherwise it's a new user
    const [courses, setCourses] = useState<Course[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const staffRole = "STAFF";

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema(isUpdate)),
    });

    useEffect(() => {
        // Fetch classes and sections first
        const fetchData = async () => {
            try {
                const [coursesResponse, staffsResponse] = await Promise.all([
                    fetch('/api/manage-course'),
                    fetch(`/api/manage-staff?role=${staffRole}`)
                ]);

                if (!coursesResponse.ok || !staffsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const coursesData = await coursesResponse.json();
                const staffsData = await staffsResponse.json();

                setCourses(coursesData);
                setStaffs(staffsData);

                // After classes and sections are loaded, fetch course data if editing
                if (id) {
                    fetchSubjectData(coursesData, staffsData);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load courses and staffs');
                setIsLoading(false);
            }
        };

        // Function to fetch subject data for editing
        const fetchSubjectData = async (coursesData: Course[], staffsData: Staff[]) => {
            try {
                const response = await fetch(`/api/manage-subject?id=${id}`);
                if (!response.ok) throw new Error('Failed to fetch subject data');
                const data = await response.json();

                setValue("subject", data.subject || '');
                
                // Format dates for the form inputs
                if (data.academicStartYear) {
                    const startDate = new Date(data.academicStartYear);
                    setValue("academicStartYear", startDate.toISOString().split('T')[0]);
                }
                
                if (data.academicEndYear) {
                    const endDate = new Date(data.academicEndYear);
                    setValue("academicEndYear", endDate.toISOString().split('T')[0]);
                }

                // Find the matching class and section from the loaded data
                const matchingCourse = coursesData.find(c => c._id === data.courseId._id);
                const matchingStaff = staffsData.find(s => s._id === data.staffId._id);

                setValue("courseId", matchingCourse?._id || '');
                setValue("staffId", matchingStaff?._id || '');
            } catch (error) {
                toast.error('Error fetching subject data');
            }
        };

        fetchData();
    }, [id, setValue]); // Remove classes and sections from dependencies

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        // Format dates to ensure they're in the correct format
        const formattedData = {
            ...data,
            academicStartYear: data.academicStartYear ? new Date(data.academicStartYear).toISOString() : undefined,
            academicEndYear: data.academicEndYear ? new Date(data.academicEndYear).toISOString() : undefined,
        };

        console.log(formattedData);
        const method = id ? 'PUT' : 'POST';
        const userData = id ? { ...formattedData, id } : formattedData;
        
        const response = await fetch(`/api/manage-subject${id ? `?id=${id}` : ''}`, {
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
            toast.success(id ? 'Subject updated successfully!' : 'Subject created successfully!');
            router.push('/manage-subject');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-base-content">Loading subjects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">{id ? 'Edit Subject' : 'Add New Subject'}</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Subject Name</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("subject")}
                                    className={`input input-bordered w-full bg-base-100 text-base-content ${errors.subject ? 'input-error' : ''}`}
                                    placeholder="Enter subject name"
                                />
                                {errors.subject && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.subject.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Course Dropdown */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Course</span>
                                </label>
                                <select
                                    {...register("courseId")}
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${errors.courseId ? 'select-error' : ''}`}
                                >
                                    <option value="">Select a course</option>
                                    {courses.map((courseItem) => (
                                        <option key={courseItem._id} value={courseItem._id} className="text-base-content bg-base-100">
                                            {courseItem.name} - Class {courseItem.class.classNumber}
                                        </option>
                                    ))}
                                </select>
                                {errors.courseId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.courseId.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Staff Dropdown */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Staff</span>
                                </label>
                                <select
                                    {...register("staffId")}
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${errors.staffId ? 'select-error' : ''}`}
                                >
                                    <option value="">Select a staff</option>
                                    {staffs.map((staff) => (
                                        <option key={staff._id} value={staff._id} className="text-base-content bg-base-100">
                                            {staff.firstName} {staff.lastName}
                                        </option>
                                    ))}
                                </select>
                                {errors.staffId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.staffId.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Academic Start Year */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Academic Start Year</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("academicStartYear")}
                                    className={`input input-bordered w-full bg-base-100 text-base-content ${errors.academicStartYear ? 'input-error' : ''}`}
                                />
                                {errors.academicStartYear && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.academicStartYear.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Academic End Year */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Academic End Year</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("academicEndYear")}
                                    className={`input input-bordered w-full bg-base-100 text-base-content ${errors.academicEndYear ? 'input-error' : ''}`}
                                />
                                {errors.academicEndYear && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.academicEndYear.message}</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="error"
                                outline
                                onClick={() => router.push('/manage-subject')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                outline
                            >
                                {id ? 'Update Subject' : 'Add Subject'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}