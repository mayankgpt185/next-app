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

interface AcademicYear {
    _id: string;
    label: string;
    startDate: string;
    endDate: string;
}

const formSchema = (isUpdate: boolean) => z.object({
    subject: z.string()
        .nonempty("Subject name is required")
        .min(2, "Subject name must be at least 2 characters long"),
    courseId: z.string().nonempty("Course is required"),
    staffId: z.string().nonempty("Staff is required"),
    academicYearId: z.string()
        .nonempty("Academic year is required")
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
    const [academicYears, setAcademicYears] = useState<{ id: string, label: string, startDate: string, endDate: string }[]>([]);
    const [showAcademicYearForm, setShowAcademicYearForm] = useState(false);
    const [newAcademicYear, setNewAcademicYear] = useState({ start: '', end: '' });

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema(isUpdate)),
    });

    // Function to handle adding a new academic year
    const handleAddAcademicYear = async () => {
        if (newAcademicYear.start && newAcademicYear.end) {
            try {
                // Call the API to save the academic year
                const response = await fetch('/api/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startDate: new Date(newAcademicYear.start).toISOString(),
                        endDate: new Date(newAcademicYear.end).toISOString()
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save academic year');
                }

                const savedYear = await response.json();

                // Format the start and end dates to include month and year
                const startDate = new Date(savedYear.startDate);
                const endDate = new Date(savedYear.endDate);

                // Add the new year to the state with proper formatting
                const formattedYear = {
                    id: savedYear._id,
                    label: `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`,
                    startDate: savedYear.startDate,
                    endDate: savedYear.endDate
                };

                setAcademicYears([...academicYears, formattedYear]);
                setNewAcademicYear({ start: '', end: '' });
                setShowAcademicYearForm(false);
                toast.success('Academic year added successfully!');
            } catch (error) {
                console.error('Error saving academic year:', error);
                toast.error('Failed to save academic year');
            }
        } else {
            toast.error('Please enter both start and end dates');
        }
    };

    useEffect(() => {
        // Fetch classes, sections, and academic years
        const fetchData = async () => {
            try {
                const [coursesResponse, staffsResponse, academicYearsResponse] = await Promise.all([
                    fetch('/api/manage-course'),
                    fetch(`/api/manage-staff?role=${staffRole}`),
                    fetch('/api/session') // Add this API endpoint to fetch academic years
                ]);

                if (!coursesResponse.ok || !staffsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const coursesData = await coursesResponse.json();
                const staffsData = await staffsResponse.json();
                const academicYearsData = await academicYearsResponse.json();

                setCourses(coursesData);
                setStaffs(staffsData);
                
                // Set academic years if API exists, otherwise use dummy data
                if (academicYearsResponse.ok) {
                    // Format the academic years data to include month and year
                    const formattedYears = academicYearsData.map((year: any) => {
                        const startDate = new Date(year.startDate);
                        const endDate = new Date(year.endDate);
                        return {
                            id: year._id,
                            label: `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`,
                            startDate: year.startDate,
                            endDate: year.endDate
                        };
                    });
                    setAcademicYears(formattedYears);
                } else {
                    // Dummy data for academic years
                    setAcademicYears([]);
                }

                // After data is loaded, fetch subject data if editing
                if (id) {
                    const subjectResponse = await fetch(`/api/manage-subject?id=${id}`);
                    if (!subjectResponse.ok) throw new Error('Failed to fetch subject data');
                    const data = await subjectResponse.json();

                    setValue("subject", data.subject || '');

                    // Find the matching class and section from the loaded data
                    const matchingCourse = coursesData.find((c: Course) => c._id === data.courseId._id);
                    const matchingStaff = staffsData.find((s: Staff) => s._id === data.staffId._id);
                    const matchingAcademicYear = academicYearsData.find((y: AcademicYear) => y._id === data.academicYearId._id);

                    setValue("courseId", matchingCourse?._id || '');
                    setValue("staffId", matchingStaff?._id || '');
                    setValue("academicYearId", matchingAcademicYear?._id || '');
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, setValue, staffRole]); // Added staffRole to dependencies

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const method = id ? 'PUT' : 'POST';
        
        // Prepare the data with the academic year ID
        const userData = id
            ? { ...data, id }
            : { ...data };

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

                            {/* Academic Start Year - Dropdown with Add New button */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Academic Year</span>
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        {...register("academicYearId")}
                                        className={`select select-bordered flex-1 bg-base-100 text-base-content ${errors.academicYearId ? 'select-error' : ''}`}
                                    >
                                        <option value="">Select academic year</option>
                                        {academicYears.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                                className="text-base-content bg-base-100"
                                            >
                                                {year.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-square"
                                        onClick={() => setShowAcademicYearForm(true)}
                                    >
                                        +
                                    </button>
                                </div>
                                {errors.academicYearId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.academicYearId.message}</span>
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

            {/* Modal for adding new academic year */}
            {showAcademicYearForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-6 text-base-content">Add New Academic Year</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-base-content">Academic Year Start Date</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered bg-base-100 text-base-content"
                                    value={newAcademicYear.start}
                                    onChange={(e) => setNewAcademicYear({ ...newAcademicYear, start: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-base-content">Academic Year End Date</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered bg-base-100 text-base-content"
                                    value={newAcademicYear.end}
                                    onChange={(e) => setNewAcademicYear({ ...newAcademicYear, end: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <Button
                                type="button"
                                variant="error"
                                outline
                                onClick={() => setShowAcademicYearForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                outline
                                onClick={handleAddAcademicYear}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}