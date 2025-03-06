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
interface Class {
    _id: string;
    classNumber: number;
}

interface Section {
    _id: string;
    section: string;
}

const formSchema = (isUpdate: boolean) => z.object({
    name: z.string()
        .nonempty("Course name is required")
        .min(2, "Course name must be at least 2 characters long"),
    classId: z.string().nonempty("Class is required"),
    sectionId: z.string().nonempty("Section is required"),
});

type FormData = z.infer<ReturnType<typeof formSchema>>;

export default function AddCoursePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isUpdate = !!id; // If `id` exists, it's an update, otherwise it's a new user
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema(isUpdate)),
    });

    useEffect(() => {
        // Fetch classes and sections first
        const fetchData = async () => {
            try {
                const [classesResponse, sectionsResponse] = await Promise.all([
                    fetch('/api/classes'),
                    fetch('/api/sections')
                ]);

                if (!classesResponse.ok || !sectionsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const classesData = await classesResponse.json();
                const sectionsData = await sectionsResponse.json();

                setClasses(classesData);
                setSections(sectionsData);
                
                // After classes and sections are loaded, fetch course data if editing
                if (id) {
                    fetchCourseData(classesData, sectionsData);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load classes and sections');
                setIsLoading(false);
            }
        };

        // Function to fetch course data for editing
        const fetchCourseData = async (classesData: Class[], sectionsData: Section[]) => {
            try {
                const response = await fetch(`/api/manage-course?id=${id}`);
                if (!response.ok) throw new Error('Failed to fetch course data');
                const data = await response.json();

                setValue("name", data.name || '');
                
                // Find the matching class and section from the loaded data
                const matchingClass = classesData.find(c => c.classNumber === data.class.classNumber);
                const matchingSection = sectionsData.find(s => s.section === data.section.section);
                
                setValue("classId", matchingClass?._id || '');
                setValue("sectionId", matchingSection?._id || '');
            } catch (error) {
                toast.error('Error fetching course data');
            }
        };

        fetchData();
    }, [id, setValue]); // Remove classes and sections from dependencies

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const method = id ? 'PUT' : 'POST';
        const userData = id ? { ...data, id } : {
            ...data,
        };
        const response = await fetch(`/api/manage-course${id ? `?id=${id}` : ''}`, {
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
            toast.success(id ? 'Course updated successfully!' : 'Course created successfully!');
            router.push('/manage-course');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-base-content">Loading course data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">{id ? 'Edit Course' : 'Add New Course'}</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Course Name</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className={`input input-bordered w-full bg-base-100 text-base-content ${errors.name ? 'input-error' : ''}`}
                                    placeholder="Enter course name"
                                />
                                {errors.name && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.name.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Class Dropdown */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Class</span>
                                </label>
                                <select 
                                    {...register("classId")} 
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${errors.classId ? 'select-error' : ''}`}
                                >
                                    <option value="">Select a class</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem._id} value={classItem._id} className="text-base-content bg-base-100">
                                            {classItem.classNumber}
                                        </option>
                                    ))}
                                </select>
                                {errors.classId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.classId.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Section Dropdown */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Section</span>
                                </label>
                                <select 
                                    {...register("sectionId")} 
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${errors.sectionId ? 'select-error' : ''}`}
                                >
                                    <option value="">Select a section</option>
                                    {sections.map((section) => (
                                        <option key={section._id} value={section._id} className="text-base-content bg-base-100">
                                            {section.section}
                                        </option>
                                    ))}
                                </select>
                                {errors.sectionId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.sectionId.message}</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="error"
                                outline
                                onClick={() => router.push('/manage-course')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                outline
                            >
                                {id ? 'Update Course' : 'Add Course'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}